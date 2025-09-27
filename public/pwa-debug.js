// Test PWA functionality
console.log("PWA Debug Test Script");

// Check service worker
if ("serviceWorker" in navigator) {
  console.log("✓ Service Worker supported");
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log(`Service Workers registered: ${registrations.length}`);
    registrations.forEach((registration) => {
      console.log("SW registration:", registration);
    });
  });
} else {
  console.log("✗ Service Worker NOT supported");
}

// Check manifest
fetch("/favicon/site.webmanifest")
  .then((response) => response.json())
  .then((manifest) => {
    console.log("✓ Manifest loaded:", manifest);
  })
  .catch((error) => {
    console.log("✗ Manifest error:", error);
  });

// Check beforeinstallprompt
let installPromptEvent = null;
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("✓ beforeinstallprompt event fired");
  installPromptEvent = e;
});

// Check if already installed
if (window.matchMedia("(display-mode: standalone)").matches) {
  console.log("✓ App is running in standalone mode (installed)");
} else {
  console.log("✗ App is NOT running in standalone mode");
}

// Check user agent
console.log("User Agent:", navigator.userAgent);
console.log("Is Android:", /Android/.test(navigator.userAgent));
console.log("Is iOS:", /iPad|iPhone|iPod/.test(navigator.userAgent));

// Test install after 5 seconds
setTimeout(() => {
  if (installPromptEvent) {
    console.log("✓ Install prompt available - you can now test the install");
    // Uncomment to auto-trigger install prompt
    // installPromptEvent.prompt();
  } else {
    console.log("✗ No install prompt available yet");
    console.log("Possible reasons:");
    console.log("- App may already be installed");
    console.log("- Not running on HTTPS (required for PWA)");
    console.log("- Browser doesn't support PWA install");
    console.log("- PWA criteria not met (manifest, service worker, etc.)");
  }
}, 5000);
