export function Footer() {
  return (
    <footer className="bg-heritage-50 border-t border-heritage-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-heritage-700 font-semibold">Archivia</p>
            <p className="text-heritage-600 text-sm">
              Plateforme de préservation du patrimoine
            </p>
          </div>
          <div className="text-heritage-600 text-sm">
            <p>© {new Date().getFullYear()} - Tous droits réservés</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
