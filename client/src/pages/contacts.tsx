import { Logo } from "@/components/ui/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contacts() {
  return (
    <div className="pb-32">
      <Logo />
      <div className="container mx-auto px-4">
        <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-extrabold group drop-shadow-lg text-center">
          <span className="text-[#872519] group-hover:text-[#a32a1d] transition-colors duration-300 hover:text-shadow">C</span>
          <span className="text-[#a32a1d] group-hover:text-[#bf3022] transition-colors duration-300 hover:text-shadow">o</span>
          <span className="text-[#bf3022] group-hover:text-[#d53727] transition-colors duration-300 hover:text-shadow">n</span>
          <span className="text-[#d53727] group-hover:text-[#e0442c] transition-colors duration-300 hover:text-shadow">t</span>
          <span className="text-[#e0442c] group-hover:text-[#e85303] transition-colors duration-300 hover:text-shadow">a</span>
          <span className="text-[#e85303] group-hover:text-[#f06306] transition-colors duration-300 hover:text-shadow">c</span>
          <span className="text-[#f06306] group-hover:text-[#f37509] transition-colors duration-300 hover:text-shadow">t</span>
          <span className="text-[#f37509] group-hover:text-[#f2860b] transition-colors duration-300 hover:text-shadow"> </span>
          <span className="text-[#f2860b] group-hover:text-[#eb9812] transition-colors duration-300 hover:text-shadow">U</span>
          <span className="text-[#eb9812] group-hover:text-[#bfd12c] transition-colors duration-300 hover:text-shadow">s</span>
        </h1>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+63 (915) 123 4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">info@kestia-boracay.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-muted-foreground">Station 2, White Beach Path, Boracay Island, Malay, Aklan, Philippines</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d966.0673411068386!2d121.95866445872192!3d11.357392999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a5f2f34826c873%3A0x1df3c0fd45d0722f!2sBoracay%20Station%202!5e0!3m2!1sen!2sph!4v1711304458607!5m2!1sen!2sph"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}