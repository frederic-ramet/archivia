'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

// Types for gallery items
interface GalleryDocument {
  id: string;
  title: string;
  filePath: string;
  category: string | null;
  period: string | null;
  tags: string[];
  description: string | null;
  transcription: string | null;
  createdAt: Date;
}

interface GalleryProps {
  documents: GalleryDocument[];
  categories?: string[];
}

export default function Gallery({ documents, categories: providedCategories }: GalleryProps) {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [selectedItem, setSelectedItem] = useState<GalleryDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Lazy loading
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Mode immersif
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [immersiveIndex, setImmersiveIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);

  // Extract categories and tags from documents
  const categories = providedCategories || Array.from(
    new Set(documents.map(d => d.category).filter((c): c is string => c !== null))
  ).sort();

  const allTags = Array.from(
    new Set(documents.flatMap(d => d.tags || []))
  ).sort();

  // Get popular tags (tags that appear in at least 2 documents)
  const popularTags = allTags.filter(tag =>
    documents.filter(d => d.tags?.includes(tag)).length >= 2
  ).slice(0, 10);

  // Filter items with search
  const filteredByCategory = selectedCategory
    ? documents.filter(d => d.category === selectedCategory)
    : documents;

  const filteredByTag = selectedTag
    ? filteredByCategory.filter(d => d.tags?.includes(selectedTag))
    : filteredByCategory;

  const filteredItems = searchQuery.trim()
    ? filteredByTag.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.period?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          item.transcription?.toLowerCase().includes(query)
        );
      })
    : filteredByTag;

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, selectedTag, searchQuery]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredItems.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 20, filteredItems.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, filteredItems.length]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  // Navigation immersive
  const currentImmersiveItem = immersiveMode ? filteredItems[immersiveIndex] : null;

  const nextImage = useCallback(() => {
    if (filteredItems.length > 0) {
      setImmersiveIndex((prev) => (prev + 1) % filteredItems.length);
      setZoomLevel(1);
    }
  }, [filteredItems.length]);

  const prevImage = useCallback(() => {
    if (filteredItems.length > 0) {
      setImmersiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      setZoomLevel(1);
    }
  }, [filteredItems.length]);

  const exitImmersive = useCallback(() => {
    setImmersiveMode(false);
    setZoomLevel(1);
    setShowOverlay(true);
  }, []);

  const enterImmersive = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedTag(undefined);
    setImmersiveIndex(0);
    setZoomLevel(1);
    setShowOverlay(true);
    setImmersiveMode(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (immersiveMode) {
        switch (e.key) {
          case 'ArrowRight':
            nextImage();
            break;
          case 'ArrowLeft':
            prevImage();
            break;
          case 'Escape':
            exitImmersive();
            break;
          case '+':
          case '=':
            setZoomLevel(prev => Math.min(prev + 0.5, 3));
            break;
          case '-':
            setZoomLevel(prev => Math.max(prev - 0.5, 1));
            break;
          case ' ':
            setShowOverlay(prev => !prev);
            e.preventDefault();
            break;
        }
      } else if (selectedItem && e.key === 'Escape') {
        setSelectedItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [immersiveMode, nextImage, prevImage, exitImmersive, selectedItem]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section className="container mx-auto py-8 px-4">
      {/* Filtres */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-heritage-900">Galerie</h2>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, description, période, tags..."
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-heritage-500 focus:ring-2 focus:ring-heritage-200 transition"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              {filteredItems.length} résultat{filteredItems.length !== 1 ? 's' : ''} pour &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Filtre Catégories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
              Par catégorie
            </h3>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(undefined)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === undefined
                    ? 'bg-heritage-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tout
              </motion.button>
              {categories.map(cat => (
                <div key={cat} className="relative group/cat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    onDoubleClick={() => enterImmersive(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-heritage-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </motion.button>
                  <button
                    onClick={() => enterImmersive(cat)}
                    className="absolute -top-2 -right-2 bg-heritage-600 text-white rounded-full p-1 opacity-0 group-hover/cat:opacity-100 transition-opacity"
                    title="Mode immersif"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Double-cliquez sur une catégorie pour le mode immersif
            </p>
          </div>
        )}

        {/* Filtre Tags - Populaires d'abord */}
        {allTags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
              Par mots-clés
            </h3>

            {/* Tags Populaires */}
            {popularTags.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 italic">Mots-clés populaires:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {popularTags.map(tag => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedTag === tag
                          ? 'bg-heritage-600 text-white shadow-lg'
                          : 'bg-heritage-50 text-heritage-700 hover:bg-heritage-100'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Tous les Tags */}
            <details className="mb-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 italic">
                Afficher tous les mots-clés ({allTags.length})
              </summary>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTag(undefined)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedTag === undefined
                      ? 'bg-heritage-200 text-heritage-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Réinitialiser
                </motion.button>
                {allTags.map(tag => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selectedTag === tag
                        ? 'bg-heritage-200 text-heritage-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Info Filtrage */}
      {filteredItems.length > 0 && (
        <div className="mb-6 text-sm text-gray-600">
          <p>
            {visibleCount < filteredItems.length
              ? `${visibleCount} sur ${filteredItems.length} images`
              : `${filteredItems.length} image${filteredItems.length > 1 ? 's' : ''}`
            }
            {selectedCategory ? ` dans "${selectedCategory}"` : ''}{selectedTag ? ` avec le mot-clé "${selectedTag}"` : ''}
          </p>
        </div>
      )}

      {/* Grille de la Galerie */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>Aucune image ne correspond à vos filtres. Essayez d&apos;autres critères.</p>
          </div>
        ) : (
          visibleItems.map(doc => (
          <motion.div
            key={doc.id}
            variants={item}
            layoutId={doc.id}
            className="group"
          >
            <button
              onClick={() => router.push(`/projects/${projectId}/documents/${doc.id}`)}
              className="block cursor-pointer w-full text-left"
            >
              <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-gray-100 hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={doc.filePath}
                  alt={doc.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="text-center text-white px-4"
                  >
                    <p className="font-serif text-lg font-semibold">{doc.title}</p>
                    <p className="text-sm text-gray-300 mt-2">
                      Cliquez pour ouvrir
                    </p>
                  </motion.div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-lg font-semibold text-heritage-900">
                  {doc.title}
                </h3>
                {doc.period && (
                  <p className="text-xs text-heritage-600 font-semibold mt-1 uppercase tracking-wider">
                    {doc.period}
                  </p>
                )}
                {doc.category && (
                  <p className="text-sm text-gray-600 mt-1">{doc.category}</p>
                )}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {doc.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-heritage-100 text-heritage-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          </motion.div>
        ))
        )}
      </motion.div>

      {/* Lazy Loading Indicator */}
      {visibleCount < filteredItems.length && (
        <div ref={loadMoreRef} className="mt-12 text-center">
          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-heritage-600"></div>
              <span className="text-gray-600">Chargement...</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              <p>Faites défiler pour voir plus d&apos;images</p>
              <p className="mt-1 text-xs">
                {filteredItems.length - visibleCount} images restantes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Standard */}
      {selectedItem && !immersiveMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            layoutId={selectedItem.id}
            className="bg-white rounded-lg overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-gray-100 flex-shrink-0">
              <Image
                src={selectedItem.filePath}
                alt={selectedItem.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
            <div className="p-6 md:p-8 overflow-y-auto flex-grow">
              <h2 className="font-serif text-3xl font-bold text-heritage-900 mb-2">
                {selectedItem.title}
              </h2>

              <div className="flex gap-3 items-center mb-4">
                {selectedItem.period && (
                  <span className="text-xs font-semibold text-heritage-600 uppercase tracking-wider bg-heritage-100 px-3 py-1 rounded-full">
                    {selectedItem.period}
                  </span>
                )}
                {selectedItem.category && (
                  <span className="text-sm text-heritage-700 font-medium">
                    {selectedItem.category}
                  </span>
                )}
              </div>

              {selectedItem.description && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.transcription && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Transcription
                  </h3>
                  <p className="text-gray-700 font-serif italic whitespace-pre-wrap">
                    {selectedItem.transcription}
                  </p>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-6">
                  {selectedItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-heritage-100 text-heritage-700 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Mode Immersif Fullscreen */}
      <AnimatePresence>
        {immersiveMode && currentImmersiveItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
          >
            {/* Image avec zoom */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <motion.div
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full h-full"
              >
                <Image
                  src={currentImmersiveItem.filePath}
                  alt={currentImmersiveItem.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </div>

            {/* Overlay avec informations */}
            <AnimatePresence>
              {showOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 md:p-12"
                >
                  <div className="max-w-4xl mx-auto">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                      {currentImmersiveItem.title}
                    </h2>

                    <div className="flex gap-4 items-center mb-4">
                      {currentImmersiveItem.period && (
                        <span className="text-sm font-semibold text-heritage-300 uppercase tracking-wider">
                          {currentImmersiveItem.period}
                        </span>
                      )}
                      {currentImmersiveItem.category && (
                        <span className="text-sm text-gray-300">
                          {currentImmersiveItem.category}
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        {immersiveIndex + 1} / {filteredItems.length}
                      </span>
                    </div>

                    {currentImmersiveItem.description && (
                      <p className="text-gray-200 text-lg mb-4 max-w-3xl">
                        {currentImmersiveItem.description}
                      </p>
                    )}

                    {currentImmersiveItem.transcription && (
                      <p className="text-gray-300 text-sm leading-relaxed max-w-3xl font-serif italic">
                        {currentImmersiveItem.transcription}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Contrôles */}
            <div className="absolute top-4 right-4 flex gap-3">
              {/* Toggle overlay */}
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition backdrop-blur-sm"
                title="Afficher/Masquer les informations (Espace)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Zoom controls */}
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                disabled={zoomLevel <= 1}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition backdrop-blur-sm disabled:opacity-50"
                title="Zoom arrière (-)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="bg-white/20 text-white rounded-full px-4 py-3 text-sm backdrop-blur-sm">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                disabled={zoomLevel >= 3}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition backdrop-blur-sm disabled:opacity-50"
                title="Zoom avant (+)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Fermer */}
              <button
                onClick={exitImmersive}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition backdrop-blur-sm"
                title="Fermer (Échap)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation gauche/droite */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition backdrop-blur-sm"
                  title="Image précédente (←)"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-4 transition backdrop-blur-sm"
                  title="Image suivante (→)"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Raccourcis clavier */}
            <div className="absolute bottom-4 right-4 text-xs text-white/50">
              ← → Navigation | + - Zoom | Espace Info | Échap Fermer
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
