/**
 * Structured data as a JSON-LD script in the server-rendered HTML. `<` is
 * escaped so text in the data can never close the script tag.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
