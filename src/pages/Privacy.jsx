import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <div className="container page narrow legal">
      <Link to="/" className="link-btn back-link">← Back</Link>
      <h1>Privacy Policy</h1>
      <p className="legal-note">
        <strong>This is a starting template, not legal advice.</strong> Review and
        tailor it to your jurisdiction before relying on it.
      </p>
      <p className="muted">Effective date: [EFFECTIVE DATE]</p>

      <h2>Who we are</h2>
      <p>
        Seasoned Opinions ("we", "us") is operated by [SITE OWNER / ENTITY NAME].
        This policy explains what we collect, why, and your choices. Questions?
        Contact <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Google account profile:</strong> when you sign in with Google
          we receive your display name, email address, and avatar photo URL.
        </li>
        <li>
          <strong>Content you post:</strong> spots, reviews, comments, ratings,
          votes, tags, links, and any image URLs you submit.
        </li>
        <li>
          <strong>Basic technical / authentication data:</strong> the sign-in
          session information needed to keep you logged in.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use this information solely to operate the site: to show who posted
        what, to enable voting, rating, and comments, and to attribute
        contributions. We do <strong>not</strong> sell your data and we do{' '}
        <strong>not</strong> show ads.
      </p>

      <h2>Where it's stored and processed</h2>
      <p>
        Data is stored and processed using Google Firebase (Cloud Firestore and
        Firebase Authentication). This means your data leaves your device and is
        handled by Google on our behalf, subject to Google's terms and privacy
        practices.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        We use cookies / local storage only to keep you signed in. We do not use
        tracking or advertising cookies.
      </p>

      <h2>Your rights and choices</h2>
      <ul>
        <li>You can delete your own spots and comments directly in the app.</li>
        <li>
          To request deletion of your account or any of your content, contact{' '}
          <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>.
        </li>
      </ul>

      <h2>Third-party links</h2>
      <p>
        The site links out to third-party services such as Google Maps,
        DoorDash, and Uber Eats. Those services have their own privacy policies
        and we are not responsible for their practices.
      </p>

      <h2>Children</h2>
      <p>
        The site is not directed to children under the age required by [GOVERNING
        JURISDICTION] (for example, 13+). Do not use it if you are under that age.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected by updating the effective date above.
      </p>

      <h2>Contact</h2>
      <p>
        [SITE OWNER / ENTITY NAME] -{' '}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>
      </p>

      <p className="muted small">
        Note: if the site grows or represents an organization, consider legal
        review for applicable laws (e.g. Canada's PIPEDA, the EU's GDPR).
      </p>
    </div>
  )
}
