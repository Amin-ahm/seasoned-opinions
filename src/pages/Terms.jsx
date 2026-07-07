import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <div className="container page narrow legal">
      <Link to="/" className="link-btn back-link">← Back</Link>
      <h1>Terms &amp; Conditions</h1>
      <p className="legal-note">
        <strong>This is a starting template, not legal advice.</strong> Review and
        tailor it to your jurisdiction before relying on it.
      </p>
      <p className="muted">Effective date: [EFFECTIVE DATE]</p>

      <p>
        These Terms govern your use of Seasoned Opinions (the "Site"), operated
        by [SITE OWNER / ENTITY NAME]. By signing in and using the Site, you
        agree to these Terms.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must have a valid Google account to sign in, and you must be at least
        the minimum age required by [GOVERNING JURISDICTION] (for example, 13+).
      </p>

      <h2>Your content</h2>
      <p>
        You keep ownership of the content you submit (spots, reviews, comments,
        ratings, votes, links, and image URLs). By posting, you grant [SITE OWNER
        / ENTITY NAME] a non-exclusive, worldwide, royalty-free license to display
        and distribute that content on the Site for the purpose of operating it.
      </p>

      <h2>Content responsibility</h2>
      <p>
        You represent and warrant that you own or have the rights to any image
        URL, text, and links you post. You must{' '}
        <strong>not</strong> post third-party copyrighted images - including
        photos copied from Google Maps, DoorDash, Uber Eats, or other websites.
        Reviews and ratings are personal opinions, not statements of fact.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>No spam, harassment, hate speech, or illegal content.</li>
        <li>No infringing, defamatory, or misleading submissions.</li>
        <li>No attempts to break, overload, or abuse the Site.</li>
      </ul>

      <h2>Moderation and takedowns</h2>
      <p>
        We may remove content or suspend accounts at our discretion, particularly
        in response to reports. The Site provides a "Report" feature on spots and
        comments. To request a takedown or raise a concern, contact{' '}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The Site is provided "as is" and "as available", without warranties of
        any kind. Ratings and reviews reflect users' opinions and are not
        endorsements by [SITE OWNER / ENTITY NAME]. We are not responsible for
        third-party services linked from the Site.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, [SITE OWNER / ENTITY NAME] is not
        liable for any indirect, incidental, or consequential damages arising
        from your use of the Site.
      </p>

      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of [GOVERNING JURISDICTION].</p>

      <h2>Contact</h2>
      <p>
        [SITE OWNER / ENTITY NAME] -{' '}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>
      </p>

      <p className="muted small">
        You can also review our <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  )
}
