import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportUpload } from "./upload-client";

export default function NewImportPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-forest mb-2">
        New POI import
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a CSV or JSON file. Required columns:{" "}
        <code className="font-mono text-xs">
          name, destination_slug, category_slug, lat, lng
        </code>
        . Optional columns:{" "}
        <code className="font-mono text-xs">
          slug, description, short_description, address, hero_image_url, rating,
          website_url, phone, duration_minutes, price_level, family_friendly,
          indoor, accessible, featured_score, best_time_of_day
        </code>
        . All imported POIs are created as <strong>draft / raw</strong> and
        require manual review before they appear on the site.
      </p>
      <a
        href="/poi-import-template.csv"
        download="poi-import-template.csv"
        className="inline-block mb-6"
      >
        <Button variant="outline" type="button">
          <Download className="mr-2 h-4 w-4" />
          Download CSV template
        </Button>
      </a>
      <ImportUpload />
    </div>
  );
}
