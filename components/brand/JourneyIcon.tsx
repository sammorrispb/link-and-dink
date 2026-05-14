export type JourneyIconSlug = "intro" | "improve" | "play";

/**
 * Inline brand SVGs (LD_ResourceSpace, LD_Event, LD_LFG) — kept inline rather
 * than <img> so they stay styleable from CSS. Raw source files also live in
 * /public/icons for reference.
 */
export default function JourneyIcon({ slug }: { slug: JourneyIconSlug }) {
  if (slug === "intro") {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#ld_clip_resource)">
          <rect width="48" height="48" fill="#CAF368" />
          <path
            d="M11.9983 34.498L34.4998 11.9998L69.2853 50.3278L45.5451 71.7769L11.9983 34.498Z"
            fill="#08472C"
          />
          <path
            d="M40 24C40 32.8366 32.8366 40 24 40C15.1634 40 8 32.8366 8 24C8 15.1634 15.1634 8 24 8C32.8366 8 40 15.1634 40 24Z"
            fill="white"
          />
          <circle cx="21" cy="24" r="1" fill="white" />
          <circle cx="24" cy="24" r="1" fill="white" />
          <circle cx="27" cy="24" r="1" fill="white" />
          <path
            d="M16 19C16 16.7909 17.7909 15 20 15H30C31.1046 15 32 15.8954 32 17V32H20C17.7909 32 16 30.2091 16 28V19Z"
            fill="#08472C"
          />
          <path
            d="M21 29C21 28.4477 21.4477 28 22 28H32V30H22C21.4477 30 21 29.5523 21 29V29Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="ld_clip_resource">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }

  if (slug === "improve") {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#ld_clip_event)">
          <rect width="48" height="48" fill="#CAF368" />
          <path
            d="M11.9983 34.498L34.4998 11.9998L69.2853 50.3278L45.5451 71.7769L11.9983 34.498Z"
            fill="#08472C"
          />
          <circle cx="24" cy="24" r="16" fill="white" />
          <path
            d="M22.8587 16.5125C23.218 15.4069 24.782 15.4069 25.1413 16.5125L26.2002 19.7716C26.3609 20.2661 26.8216 20.6008 27.3415 20.6008H30.7684C31.9309 20.6008 32.4142 22.0884 31.4737 22.7716L28.7013 24.7859C28.2807 25.0915 28.1048 25.6331 28.2654 26.1276L29.3244 29.3867C29.6836 30.4923 28.4182 31.4116 27.4778 30.7284L24.7053 28.7141C24.2848 28.4085 23.7152 28.4085 23.2947 28.7141L20.5222 30.7284C19.5818 31.4116 18.3164 30.4923 18.6756 29.3867L19.7346 26.1276C19.8952 25.6331 19.7193 25.0915 19.2987 24.7859L16.5263 22.7716C15.5858 22.0883 16.0691 20.6008 17.2316 20.6008H20.6585C21.1784 20.6008 21.6391 20.2661 21.7998 19.7716L22.8587 16.5125Z"
            fill="#08472C"
          />
        </g>
        <defs>
          <clipPath id="ld_clip_event">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
    );
  }

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#ld_clip_lfg)">
        <rect width="48" height="48" fill="#CAF368" />
        <path
          d="M11.9983 34.498L34.4998 11.9998L69.2853 50.3278L45.5451 71.7769L11.9983 34.498Z"
          fill="#08472C"
        />
        <circle cx="24" cy="24" r="16" fill="white" />
        <circle cx="21" cy="24" r="1" fill="white" />
        <circle cx="24" cy="24" r="1" fill="white" />
        <circle cx="27" cy="24" r="1" fill="white" />
        <path
          d="M17 18.9103C17 17.0268 18.567 15.5 20.5 15.5H27.5C29.433 15.5 31 17.0268 31 18.9103V25.4089C31 26.4598 30.5027 27.452 29.6522 28.0982L26.583 30.4301C26.1577 30.7532 25.9091 31.2493 25.9091 31.7748V34.2564C25.9091 35.1981 25.1256 35.9615 24.1591 35.9615H23.8409C22.8744 35.9615 22.0909 35.1981 22.0909 34.2564V31.7748C22.0909 31.2493 21.8423 30.7532 21.417 30.4301L18.3478 28.0982C17.4973 27.452 17 26.4598 17 25.4089V18.9103Z"
          fill="#08472C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.3846 18.7308C21.4925 18.7308 20.7692 19.5017 20.7692 20.4527V23.7339C20.7692 24.2646 20.9987 24.7655 21.3913 25.0918L21.9742 25.5763C22.5129 26.0241 23.1913 26.2692 23.8918 26.2692H24.1082C24.8087 26.2692 25.4871 26.0241 26.0258 25.5763L26.6087 25.0918C27.0013 24.7655 27.2308 24.2646 27.2308 23.7339V20.4527C27.2308 19.5017 26.5075 18.7308 25.6154 18.7308H22.3846Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="ld_clip_lfg">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
