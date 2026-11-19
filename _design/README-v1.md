# U-Train Driving School — website

A static marketing site for U-Train Driving School, Kampala.
*Learn well. Go well.*

Plain HTML, one stylesheet and one small script. No framework, no build step,
nothing to install before it will run.

---

## Run it locally

```
node server.js 4190
```

Then open <http://localhost:4190>. `server.js` is a ~40-line static file server
and is **not** uploaded to the host — it exists only for previewing.

---

## The pages

| File | What it is |
| --- | --- |
| `index.html` | Home — hero, services, courses, the four-step journey, branches, FAQ |
| `about.html` | The school, mission/vision/values, why choose us, inside a lesson, campaign flyers |
| `courses.html` | Three full courses, six skills modules, comparison table, schedules, FAQ |
| `permits.html` | Permit processing, renewal, class extensions, requirements, classes, FAQ |
| `enroll.html` | Registration form, what to bring, what happens next |
| `contact.html` | All five branches, map, message form, every phone number |
| `404.html` | Wrong-turn page (set as the error document on the host) |

Supporting files: `robots.txt`, `sitemap.xml`, `assets/`, `tools/`.

---

## Editing

**Content** lives directly in each `.html` file — open it and edit the text.

**Colours, spacing and components** are all in `assets/css/styles.css`, which
opens with a token block (`:root`). Change the brand colours there and they
change everywhere:

```css
--red-500:#E0151D;   /* U-Train red   */
--navy-900:#081A47;  /* U-Train navy  */
--amber:#FFC02E;     /* road markings */
```

**Phone numbers used by the scripts** are at the top of `assets/js/main.js`:

```js
var SCHOOL = {
  whatsapp: '256755938383',   // digits only, international format
  phoneMain: '0755938383',
  phoneAlt:  '0753197776'
};
```

Changing that constant changes where the forms send people. The `tel:` and
`wa.me` links written directly in the HTML have to be changed in the HTML.

### Changing the menu or the footer

The nav and footer are repeated in all seven pages, as they must be without a
build step. Edit **`index.html`** only, then run:

```
python tools/sync-chrome.py
```

That copies everything outside `<main>` from `index.html` onto the other six
pages, keeping each page's own content and metadata. It prints what it changed.

---

## Forms

There is no server behind this site, so the two forms (`enroll.html` and
`contact.html`) compose a tidy WhatsApp message from what the visitor typed and
open WhatsApp with it ready to send. Nothing is stored by the website, and
nothing is sent until the visitor presses send in WhatsApp. An "email instead"
link sits beside each button as a fallback.

If a real inbox is wanted later, point the `<form>` at a form service
(Formspree, Web3Forms and similar all work with static hosting) and delete the
`data-wa-form` attribute — the JavaScript then leaves the form alone.

---

## Deploying

Pushing to `main` uploads the site to Hostinger over FTPS via
`.github/workflows/deploy-hostinger.yml` — the same workflow used by the other
school sites in this folder.

Three repository secrets must exist under
**Settings → Secrets and variables → Actions**:

| Secret | Where it comes from |
| --- | --- |
| `FTP_SERVER` | hPanel → Files → FTP Accounts |
| `FTP_USERNAME` | that FTP account's username |
| `FTP_PASSWORD` | that FTP account's password |

And one optional repository **variable**:

| Variable | Set it to |
| --- | --- |
| `FTP_SERVER_DIR` | `/` when the FTP account is already scoped to `public_html`, otherwise leave unset |

Until all three secrets exist the workflow finishes green having uploaded
nothing, so it is safe to commit before the hosting is ready.

Do not use Hostinger's own Git integration — it does not work for these sites.

---

## Content notes — please confirm before going live

Everything on the site was taken from the school's own flyers. Two things are
worth a second look:

1. **Phone numbers.** The flyers carry two different pairs:
   `0755 938383 / 0753 197776` on the branch flyer, and
   `0781 204007 / 0708 251871` on the services banner. The site treats the
   first pair as the main line and WhatsApp number, and the second pair as the
   Nakawa office and permit desk. Swap them if that is the wrong way round.
   All four appear on `contact.html` and in the footer.

2. **Branch descriptions.** Read from the flyer as Kireka (at Sankara
   building), Kiwatule (at the taxi stage), Kyaliwajjala (opposite Pride Bank)
   and Manyangwa (Trading Centre). The flyer print is small — check the
   spellings.

Also outstanding:

- **Testimonials** on `index.html` are placeholders, each marked with a
  "Sample review" chip. Replace the three quotes with real learner words and
  delete the chips.
- **Photographs.** The site is illustrated with SVG artwork because the only
  images available were low-resolution flyers. Real photos of the cars,
  instructors and classes would lift it considerably — the natural places are
  the hero panel, the "Inside the lesson" section on `about.html`, and the
  branch cards.
- **Fees** are deliberately not published; every price points at a phone call.
  If the school wants figures on the site, `courses.html` has a comparison
  table ready for a price column.
- **Domain.** `utraindrivingschool.com` is used as a placeholder in the
  canonical tags, `robots.txt` and `sitemap.xml`. Change it to the real domain
  before launch.

---

## Accessibility & performance

- Skip link, landmark elements, `aria-current` on the active nav item, labelled
  form fields and a visible focus ring.
- All animation is disabled under `prefers-reduced-motion`.
- A print stylesheet flattens the dark sections so pages print legibly.
- No images larger than the flyers, no web fonts beyond two Google families, no
  JavaScript libraries.
