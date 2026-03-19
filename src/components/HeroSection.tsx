import { BookOpen, Download, Star, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="gradient-hero py-16 md:py-24">
      <div className="container text-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
          NoteHive
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Share and discover quality study notes from students across all semesters.
          Free, open, and community-driven.
        </p>
        <p className="text-sm text-primary-foreground/60 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          Built by the Community
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
          {[
            { icon: BookOpen, label: "Study Notes", desc: "PDF resources" },
            { icon: Download, label: "Free Downloads", desc: "No restrictions" },
            { icon: Star, label: "Community Rated", desc: "Quality first" },
            { icon: Users, label: "Student Driven", desc: "By students, for students" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="glass-card rounded-xl p-4 text-center animate-fade-in"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <item.icon className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="font-semibold text-card-foreground text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
