import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Licences",
  description: "The font and third-party software this site uses, and the licences they are used under.",
};

const libraries: { name: string; use: string; licence: string; href: string }[] = [
  { name: "Next.js", use: "Site framework", licence: "MIT", href: "https://github.com/vercel/next.js" },
  { name: "React", use: "User interface", licence: "MIT", href: "https://github.com/facebook/react" },
  { name: "Tailwind CSS", use: "Styling", licence: "MIT", href: "https://github.com/tailwindlabs/tailwindcss" },
  { name: "GSAP", use: "Animation", licence: "GSAP Standard “no charge” licence", href: "https://gsap.com/standard-license" },
  { name: "Lenis", use: "Smooth scrolling", licence: "MIT", href: "https://github.com/darkroomengineering/lenis" },
  { name: "OGL", use: "WebGL hero background", licence: "Unlicense", href: "https://github.com/oframe/ogl" },
  { name: "Swiper", use: "Project carousel", licence: "MIT", href: "https://github.com/nolimits4web/swiper" },
  {
    name: "UI Initiative Stories Slider",
    use: "Project story viewer",
    licence: "UI Initiative Regular Licence (commercial)",
    href: "https://uiinitiative.com",
  },
  { name: "React Hook Form", use: "Contact form", licence: "MIT", href: "https://github.com/react-hook-form/react-hook-form" },
  { name: "next-themes", use: "Light and dark mode", licence: "MIT", href: "https://github.com/pacocoursey/next-themes" },
  {
    name: "@next/third-parties",
    use: "Google Analytics loader",
    licence: "MIT",
    href: "https://github.com/vercel/next.js/tree/canary/packages/third-parties",
  },
];

const OFL = `Copyright 2017 The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) and the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.`;

const sections: LegalSection[] = [
  {
    id: "font",
    title: "Typeface: Archivo",
    body: (
      <>
        <p>
          All text on this site is set in{" "}
          <a href="https://github.com/Omnibus-Type/Archivo" rel="noopener noreferrer" target="_blank">
            Archivo<span className="sr-only"> (opens in a new tab)</span>
          </a>
          , designed by Omnibus-Type and published under the SIL Open Font License 1.1. The font files
          are served from this site. The full licence is below.
        </p>
        <pre tabIndex={0} aria-label="SIL Open Font License 1.1 for Archivo">
          {OFL}
        </pre>
      </>
    ),
  },
  {
    id: "software",
    title: "Software",
    body: (
      <>
        <p>The site is built with the following libraries. Thanks to everyone who maintains them.</p>
        <div className="table-wrap" role="region" aria-label="Software licences" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">Library</th>
                <th scope="col">Used for</th>
                <th scope="col">Licence</th>
              </tr>
            </thead>
            <tbody>
              {libraries.map((l) => (
                <tr key={l.name}>
                  <td>
                    <a href={l.href} rel="noopener noreferrer" target="_blank">
                      {l.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </td>
                  <td>{l.use}</td>
                  <td>{l.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "marks",
    title: "Trademarks",
    body: (
      <p>
        GitHub, LinkedIn, X, Facebook and WhatsApp names and icons are trademarks of their owners and
        are used only to link to those services. Client names and logos belong to their owners.
      </p>
    ),
  },
];

export default function LicensesPage() {
  return (
    <LegalPage
      title="Licences"
      lead="The typeface and open-source software this site is built with, and the terms they come under."
      updated="16 November 2026"
      sections={sections}
    />
  );
}
