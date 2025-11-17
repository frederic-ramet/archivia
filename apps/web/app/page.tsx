export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-heritage-700 to-heritage-900 text-white py-20">
        <div className="container-wide text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Archivia</h1>
          <p className="text-xl md:text-2xl text-heritage-200 max-w-3xl mx-auto mb-8">
            Plateforme de numérisation, analyse et valorisation du patrimoine
            culturel
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/projects" className="btn btn-primary text-lg px-8 py-3">
              Mes Projets
            </a>
            <a
              href="/projects/new"
              className="btn btn-outline border-white text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Nouveau Projet
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">
                Numérisation & OCR
              </h3>
              <p className="text-heritage-600">
                Extrayez le texte de documents manuscrits ou imprimés avec
                l&apos;intelligence artificielle
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">
                Recherche Sémantique
              </h3>
              <p className="text-heritage-600">
                Trouvez des documents par sens, pas seulement par mots-clés,
                grâce aux embeddings vectoriels
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Export HTML</h3>
              <p className="text-heritage-600">
                Générez des sites web autonomes déployables sur GitHub Pages ou
                Netlify
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-heritage-100">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à préserver votre patrimoine ?</h2>
          <p className="text-lg text-heritage-700 mb-8 max-w-2xl mx-auto">
            Créez votre premier projet et commencez à numériser, analyser et
            partager vos archives
          </p>
          <a href="/projects/new" className="btn btn-primary text-lg px-10 py-4">
            Commencer maintenant
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-heritage-900 text-heritage-200 py-8">
        <div className="container-wide text-center">
          <p className="mb-2">
            Archivia - Plateforme Open Source de Préservation du Patrimoine
          </p>
          <p className="text-sm text-heritage-400">
            Licence MIT • Créé avec Next.js, React et TypeScript
          </p>
        </div>
      </footer>
    </main>
  );
}
