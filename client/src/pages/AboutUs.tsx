import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  GraduationCap, 
  Heart,
  Mail,
  Users
} from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            About SnapTrade
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            About SnapTrade
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Making chart analysis smarter, simpler, and more accessible for traders at all levels
          </p>
        </div>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {/* Our Mission */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-blue-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                SnapTrade was built to make chart analysis smarter, simpler, and more accessible. We aim to support traders at all levels by offering tools that help them recognize patterns, stay updated with market news, and make more informed decisions — all in an educational and user-friendly way.
              </p>
            </CardContent>
          </Card>

          {/* What We Do */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                What We Do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                SnapTrade allows you to upload images of forex or stock charts. Our system then analyzes these charts using pattern recognition technology, and overlays real-time news to help you understand potential outcomes based on current market conditions.
              </p>
            </CardContent>
          </Card>

          {/* For Education Only */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <GraduationCap className="h-6 w-6 text-amber-500" />
                For Education Only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong>SnapTrade is a tool for learning and analysis.</strong> We do not offer financial advice, trade signals, or investment recommendations. All content and features are intended for educational purposes only — decisions made using this platform are your own responsibility.
              </p>
            </CardContent>
          </Card>

          {/* Why We Created SnapTrade */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-purple-500" />
                Why We Created SnapTrade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                As traders ourselves, we saw a gap — most platforms were either too complex, too expensive, or didn't focus enough on visual learning. We wanted to change that. SnapTrade was created to bridge the gap between technology and trading education.
              </p>
            </CardContent>
          </Card>

          {/* Our Commitment */}
          <Card className="border-l-4 border-l-rose-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="h-6 w-6 text-rose-500" />
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are committed to improving the SnapTrade experience based on your feedback. As markets evolve, so will our tools. We're building this platform not just for you — but with you.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="h-6 w-6 text-indigo-500" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Need help, have feedback, or want to collaborate? Get in touch with us:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Mail className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="font-medium">General Enquiries</p>
                    <a 
                      href="mailto:contact@snaptrade.co.uk" 
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      contact@snaptrade.co.uk
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Mail className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium">Support</p>
                    <a 
                      href="mailto:support@snaptrade.co.uk" 
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      support@snaptrade.co.uk
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}