/* ============================================================
   COURSE NOTES — grouped by course area, newest note first.

   To publish a new note:
   1. Drop your .md file in  coursenote/<area>/<slug>.md
   2. Make sure  coursenote/<area>/post.html  exists
      (copy it from an existing area if the area is new).
   3. Add / update the area block below and add the note object.
   That's it — coursenote/index.html and the post pages do the rest.

   area.slug     folder name under coursenote/  (also the ?area in URLs)
   area.title    display name of the course area
   area.blurb    one line shown under the area heading on the index
   note.slug     used in the URL:  coursenote/<area>/post.html?slug=SLUG
   note.title    note title
   note.date     short label, e.g. "Sep 2026"
   note.excerpt  one or two lines shown on the index
   note.file     path to the markdown source, relative to site root
   ============================================================ */

const COURSE_NOTES = {
  areas: [
    {
      slug: "foundational_cv",
      title: "Foundational Computer Vision",
      blurb: "Pre-deep-learning fundamentals — filtering, edges, features, and multi-view geometry.",
      notes: [
        {
          slug: "image_filtering",
          title: "Image Filtering",
          date: "Sep 2026",
          excerpt: "Local averages and differences, convolution vs. cross-correlation, the Gaussian and the Central Limit Theorem, impulse response, and the 2D lift to image gradients.",
          file: "coursenote/foundational_cv/image_filtering.md"
        }
      ]
    }
  ]
};
