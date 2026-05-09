export default function PetitionFooterImage() {
  return (
    <section
      aria-hidden="true"
      className="relative w-full h-[70vh] min-h-[500px] mt-16 overflow-hidden bg-bone"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/mangere-mountain.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/40 to-forest/60" />
    </section>
  );
}
