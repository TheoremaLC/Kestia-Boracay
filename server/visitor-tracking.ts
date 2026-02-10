
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

interface VisitorData {
  id: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  // Kept optional for backward compatibility with older persisted data.
  userAgent?: string;
}

interface VisitorStats {
  totalUniqueVisitors: number;
  returningVisitors: number;
  newVisitorsToday: number;
  returningVisitorsToday: number;
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const VISITORS_FILE =
  process.env.VISITORS_FILE || path.join(DATA_DIR, 'visitors.json');
const LEGACY_VISITORS_FILE = path.join(process.cwd(), 'visitors.json');

const VISITOR_TRACKING_SECRET =
  process.env.VISITOR_TRACKING_SECRET || process.env.SESSION_SECRET || '';

const RETENTION_DAYS = Number(process.env.VISITOR_RETENTION_DAYS || 30);
const MAX_VISITORS = Number(process.env.MAX_VISITORS || 50000);

export class VisitorTracker {
  private writeLock: Promise<void> = Promise.resolve();

  private async ensureDataDir(): Promise<void> {
    await fs.mkdir(path.dirname(VISITORS_FILE), { recursive: true });
  }

  private async readVisitors(): Promise<VisitorData[]> {
    try {
      await this.ensureDataDir();

      // One-time migration: if the legacy file exists and the new file doesn't, copy it over.
      // We avoid deleting the legacy file here to prevent surprising operators.
      try {
        await fs.access(VISITORS_FILE);
      } catch {
        try {
          const legacy = await fs.readFile(LEGACY_VISITORS_FILE, 'utf8');
          await fs.writeFile(VISITORS_FILE, legacy);
        } catch {
          // ignore
        }
      }

      const data = await fs.readFile(VISITORS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  private async writeVisitors(visitors: VisitorData[]): Promise<void> {
    await this.ensureDataDir();
    const tmp = `${VISITORS_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(visitors, null, 2));
    await fs.rename(tmp, VISITORS_FILE);
  }

  private generateVisitorId(ip: string, userAgent: string): string {
    // Use an HMAC so the identifier isn't directly derived from IP+UA without a server secret.
    const input = `${ip}\n${userAgent}`;
    if (VISITOR_TRACKING_SECRET) {
      return crypto
        .createHmac('sha256', VISITOR_TRACKING_SECRET)
        .update(input)
        .digest('hex')
        .slice(0, 32);
    }

    // Fallback: non-cryptographic hash if no secret is configured.
    // This should be considered less privacy-preserving; set VISITOR_TRACKING_SECRET.
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString();
  }

  private pruneVisitors(visitors: VisitorData[], nowIso: string): VisitorData[] {
    let out = visitors;
    if (Number.isFinite(RETENTION_DAYS) && RETENTION_DAYS > 0) {
      const cutoffMs = Date.parse(nowIso) - RETENTION_DAYS * 24 * 60 * 60 * 1000;
      out = out.filter((v) => Date.parse(v.lastVisit) >= cutoffMs);
    }
    if (Number.isFinite(MAX_VISITORS) && MAX_VISITORS > 0 && out.length > MAX_VISITORS) {
      // Keep most recent visitors if we exceed the cap.
      out = [...out].sort((a, b) => Date.parse(b.lastVisit) - Date.parse(a.lastVisit)).slice(0, MAX_VISITORS);
    }
    return out;
  }

  async trackVisitor(ip: string, userAgent: string): Promise<{ isNew: boolean; isReturning: boolean }> {
    // Serialize file read/modify/write to avoid data loss under concurrent requests.
    let result: { isNew: boolean; isReturning: boolean } = { isNew: false, isReturning: false };
    this.writeLock = this.writeLock.then(async () => {
      const visitors = await this.readVisitors();
      const visitorId = this.generateVisitorId(ip, userAgent);
      const now = new Date().toISOString();

      const existingVisitor = visitors.find(v => v.id === visitorId);
      if (existingVisitor) {
        existingVisitor.lastVisit = now;
        existingVisitor.visitCount += 1;
        result = { isNew: false, isReturning: true };
      } else {
        const newVisitor: VisitorData = {
          id: visitorId,
          firstVisit: now,
          lastVisit: now,
          visitCount: 1,
        };
        visitors.push(newVisitor);
        result = { isNew: true, isReturning: false };
      }

      const pruned = this.pruneVisitors(visitors, now);
      await this.writeVisitors(pruned);
    });

    await this.writeLock;
    return result;
  }

  async getStats(): Promise<VisitorStats> {
    const visitors = await this.readVisitors();
    const today = new Date().toISOString().split('T')[0];
    
    const totalUniqueVisitors = visitors.length;
    const returningVisitors = visitors.filter(v => v.visitCount > 1).length;
    
    const newVisitorsToday = visitors.filter(v => 
      v.firstVisit.startsWith(today)
    ).length;
    
    const returningVisitorsToday = visitors.filter(v => 
      v.lastVisit.startsWith(today) && v.visitCount > 1
    ).length;

    return {
      totalUniqueVisitors,
      returningVisitors,
      newVisitorsToday,
      returningVisitorsToday
    };
  }
}

export const visitorTracker = new VisitorTracker();
