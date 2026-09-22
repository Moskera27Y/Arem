import { Fragment } from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Inject structured data (JSON-LD / schema.org) into <head>. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <Fragment>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Fragment>
  );
}
