"use client";

export default function CopyLinkButton() {
  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      alert("Lien copié !");
    });
  };

  return (
    <span
      onClick={handleCopy}
      style={{ color: "#1CA7A6", cursor: "pointer", textDecoration: "underline" }}
    >
      Copier le lien
    </span>
  );
}
