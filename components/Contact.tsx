'use client';

export default function Contact() {
  const socials = [
    { name: "GitHub", link: "https://github.com/yourusername" },
    { name: "LinkedIn", link: "https://linkedin.com/in/yourusername" },
    { name: "Twitter", link: "https://twitter.com/yourusername" },
  ];

  return (
    <section className="bg-background py-20 px-6 md:px-12 text-center">
      <h2 className="text-3xl md:text-4xl font-heading text-text mb-6">
        Get In Touch
      </h2>
      <p className="text-muted font-body mb-8">
        I’m open to new opportunities or collaborations. Let’s build something
        amazing.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {socials.map((social, idx) => (
          <a
            key={idx}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg font-heading text-white bg-gradient-to-r from-[rgb(var(--gradient-start))] via-[rgb(var(--gradient-middle))] to-[rgb(var(--gradient-end))] hover:brightness-110 transition-all"
          >
            {social.name}
          </a>
        ))}
      </div>
    </section>
  );
}
