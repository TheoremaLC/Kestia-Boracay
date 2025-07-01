
import { promises as fs } from 'fs';
import path from 'path';

interface VisitorData {
  id: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  userAgent: string;
}

interface VisitorStats {
  totalUniqueVisitors: number;
  returningVisitors: number;
  newVisitorsToday: number;
  returningVisitorsToday: number;
}

const VISITORS_FILE = path.join(process.cwd(), 'visitors.json');

export class VisitorTracker {
  private async readVisitors(): Promise<VisitorData[]> {
    try {
      const data = await fs.readFile(VISITORS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeVisitors(visitors: VisitorData[]): Promise<void> {
    await fs.writeFile(VISITORS_FILE, JSON.stringify(visitors, null, 2));
  }

  private generateVisitorId(ip: string, userAgent: string): string {
    // Simple hash function for generating visitor ID
    const str = ip + userAgent;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  async trackVisitor(ip: string, userAgent: string): Promise<{ isNew: boolean; isReturning: boolean }> {
    const visitors = await this.readVisitors();
    const visitorId = this.generateVisitorId(ip, userAgent);
    const now = new Date().toISOString();
    
    const existingVisitor = visitors.find(v => v.id === visitorId);
    
    if (existingVisitor) {
      existingVisitor.lastVisit = now;
      existingVisitor.visitCount += 1;
      await this.writeVisitors(visitors);
      return { isNew: false, isReturning: true };
    } else {
      const newVisitor: VisitorData = {
        id: visitorId,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        userAgent
      };
      visitors.push(newVisitor);
      await this.writeVisitors(visitors);
      return { isNew: true, isReturning: false };
    }
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
