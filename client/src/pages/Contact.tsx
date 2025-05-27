import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MessageCircle, 
  HelpCircle,
  Clock,
  MapPin,
  Phone
} from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Get In Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contact SnapTrade
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're here to help! Reach out with any questions, feedback, or collaboration ideas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">How Can We Help?</h2>
            
            {/* General Enquiries */}
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  General Enquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Questions about SnapTrade, partnerships, or general feedback? We'd love to hear from you.
                </p>
                <Button asChild className="w-full">
                  <a href="mailto:contact@snaptrade.co.uk">
                    <Mail className="h-4 w-4 mr-2" />
                    contact@snaptrade.co.uk
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                  Technical Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Need help with your account, experiencing technical issues, or have questions about features?
                </p>
                <Button asChild variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                  <a href="mailto:support@snaptrade.co.uk">
                    <Mail className="h-4 w-4 mr-2" />
                    support@snaptrade.co.uk
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">General Enquiries:</span>
                    <span className="font-medium">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technical Support:</span>
                    <span className="font-medium">12-24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Urgent Issues:</span>
                    <span className="font-medium">Within 8 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Alternative */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Quick Contact Guide</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>What to Include in Your Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-medium mb-2">For Technical Support:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your account username or email</li>
                    <li>• Description of the issue</li>
                    <li>• Steps you've already tried</li>
                    <li>• Screenshots if applicable</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <h4 className="font-medium mb-2">For General Enquiries:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clear subject line</li>
                    <li>• Detailed description of your enquiry</li>
                    <li>• Any relevant background information</li>
                    <li>• Preferred response method</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h4 className="font-medium mb-2">For Feedback:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Specific feature or area of feedback</li>
                    <li>• What you liked or didn't like</li>
                    <li>• Suggestions for improvement</li>
                    <li>• How it affects your trading workflow</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-amber-700 dark:text-amber-400">
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Remember: SnapTrade is for educational purposes only. We do not provide financial advice or trading recommendations. Please do not send requests for investment guidance or trading signals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Why Contact Us?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">Get Help</p>
                  <p className="text-muted-foreground">Technical support and guidance</p>
                </div>
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-medium">Share Feedback</p>
                  <p className="text-muted-foreground">Help us improve SnapTrade</p>
                </div>
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">Collaborate</p>
                  <p className="text-muted-foreground">Partnership opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}