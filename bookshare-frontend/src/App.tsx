import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { AuthWidget } from './components/AuthWidget'
import { AuthModal } from './components/AuthModal'
import { getToken, setToken, removeToken, decodeToken, apiGetUserProfile } from './utils/auth'
import type { UserProfile } from './utils/auth'
import { useToast } from './components/Toast'


interface Book {
  id: number
  title: string
  author: string
  category: string
  owner: string
  status: 'Disponível' | 'Emprestado'
  coverGradient: string
}

function App() {
  const { showToast } = useToast()
  const [count, setCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  
  // Auth states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  
  // New book form state
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newCategory, setNewCategory] = useState('Programação')
  const [newOwner, setNewOwner] = useState('Você')

  const [books, setBooks] = useState<Book[]>([
    {
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      category: "Programação",
      owner: "Gabriel R.",
      status: "Disponível",
      coverGradient: "from-blue-600 to-cyan-500"
    },
    {
      id: 2,
      title: "Design Patterns",
      author: "Erich Gamma, Richard Helm",
      category: "Design de Software",
      owner: "Mariana S.",
      status: "Emprestado",
      coverGradient: "from-purple-600 to-indigo-500"
    },
    {
      id: 3,
      title: "You Don't Know JS",
      author: "Kyle Simpson",
      category: "JavaScript",
      owner: "Alex M.",
      status: "Disponível",
      coverGradient: "from-amber-500 to-yellow-400"
    },
    {
      id: 4,
      title: "The Pragmatic Programmer",
      author: "David Thomas, Andrew Hunt",
      category: "Carreira",
      owner: "Julia B.",
      status: "Disponível",
      coverGradient: "from-emerald-600 to-teal-500"
    },
    {
      id: 5,
      title: "Refactoring",
      author: "Martin Fowler",
      category: "Design de Software",
      owner: "Gabriel R.",
      status: "Disponível",
      coverGradient: "from-rose-600 to-pink-500"
    },
    {
      id: 6,
      title: "Eloquent JavaScript",
      author: "Marijn Haverbeke",
      category: "JavaScript",
      owner: "Lucas K.",
      status: "Emprestado",
      coverGradient: "from-orange-500 to-red-500"
    }
  ])

  // Simple backend status check
  useEffect(() => {
    fetch('http://localhost:3002/api')
      .then(res => {
        if (res.ok) setBackendStatus('online')
        else setBackendStatus('offline')
      })
      .catch(() => {
        // Fallback check to root path
        fetch('http://localhost:3002')
          .then(() => setBackendStatus('online'))
          .catch(() => setBackendStatus('offline'))
      })
  }, [])

  function handleLogout() {
    removeToken()
    setIsLoggedIn(false)
    setUserProfile(null)
    showToast('Sessão encerrada com sucesso.', 'info')
  }

  function handleAuthSuccess(newToken: string) {
    setToken(newToken)
    setIsLoggedIn(true)
    const decoded = decodeToken(newToken)
    if (decoded) {
      apiGetUserProfile(decoded.sub, newToken)
        .then(profile => {
          setUserProfile(profile)
        })
        .catch(err => {
          console.error("Erro ao carregar perfil após login:", err)
        })
    }
  }

  // Load session on startup
  useEffect(() => {
    const token = getToken()
    if (token) {
      const decoded = decodeToken(token)
      if (decoded) {
        const currentTime = Date.now() / 1000
        if (decoded.exp < currentTime) {
          handleLogout()
        } else {
          setIsLoggedIn(true)
          apiGetUserProfile(decoded.sub, token)
            .then(profile => {
              setUserProfile(profile)
            })
            .catch(() => {
              handleLogout()
            })
        }
      } else {
        handleLogout()
      }
    }
  }, [])

  // Keep owner name synchronized with logged-in user
  useEffect(() => {
    if (isLoggedIn && userProfile) {
      setNewOwner(userProfile.nome)
    } else {
      setNewOwner('Você')
    }
  }, [isLoggedIn, userProfile])

  const categories = ['Todos', 'Programação', 'Design de Software', 'JavaScript', 'Carreira']

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newAuthor) return

    const newBook: Book = {
      id: Date.now(),
      title: newTitle,
      author: newAuthor,
      category: newCategory,
      owner: newOwner,
      status: 'Disponível',
      coverGradient: getRandomGradient()
    }

    setBooks([newBook, ...books])
    const titleShared = newTitle
    setNewTitle('')
    setNewAuthor('')
    setIsModalOpen(false)
    showToast(`Livro "${titleShared}" compartilhado com sucesso!`, 'success')
  }

  const handleRequestLoan = (bookId: number) => {
    const book = books.find(b => b.id === bookId)
    if (!book) return

    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'Emprestado' } : b))
    showToast(`Solicitação de empréstimo do livro "${book.title}" enviada para ${book.owner}!`, 'success')
  }

  const getRandomGradient = () => {
    const gradients = [
      "from-fuchsia-600 to-pink-500",
      "from-violet-600 to-purple-500",
      "from-cyan-500 to-blue-500",
      "from-emerald-500 to-teal-400",
      "from-rose-500 to-orange-400"
    ]
    return gradients[Math.floor(Math.random() * gradients.length)]
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Fixed Auth Widget */}
      <AuthWidget
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px] animate-pulse-glow pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-violet-600/20">
              BS
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 m-0">
                BookShare <span className="text-xs font-normal text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">dsc-2026</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 pr-32 md:pr-36">
            {/* Backend connection status */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' :
                backendStatus === 'offline' ? 'bg-rose-500 shadow-md shadow-rose-500/50' :
                'bg-amber-500 animate-pulse'
              }`} />
              <span className="text-slate-400 font-medium hidden sm:inline">
                API Backend: {
                  backendStatus === 'online' ? 'Online' :
                  backendStatus === 'offline' ? 'Offline' :
                  'Verificando...'
                }
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img src={viteLogo} className="h-6 w-6 hover:scale-110 transition-transform duration-300" alt="Vite logo" />
              <img src={reactLogo} className="h-6 w-6 animate-[spin_12s_linear_infinite]" alt="React logo" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 relative z-10">
        {/* Welcome Section */}
        <section className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              Compartilhe Conhecimento, Expanda Mentes
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              Boas-vindas à rede local BookShare. Acesse livros técnicos compartilhados, solicite o que precisar e compartilhe sua própria biblioteca com outros desenvolvedores.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => setCount(prev => prev + 1)}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/60 font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 group cursor-pointer"
            >
              🎉 Interações no App
              <span className="bg-violet-600 text-white text-xs px-2.5 py-1 rounded-full font-bold transition-all group-hover:scale-110">
                {count}
              </span>
            </button>
          </div>
        </section>

        {/* Toolbar & Filter area */}
        <section className="mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search and Action */}
          <div className="flex gap-3">
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Pesquisar por título ou autor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all"
              />
              <span className="absolute right-3.5 top-3 text-slate-500">🔍</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              + Compartilhar um Livro
            </button>
          </div>
        </section>

        {/* Books Grid */}
        <section>
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => (
                <div
                  key={book.id}
                  className="rounded-2xl bg-slate-900/50 border border-slate-800/60 hover:border-slate-700/60 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/[0.03] p-5 flex flex-col h-full group relative overflow-hidden"
                >
                  {/* Subtle top light effect */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex gap-4 items-start mb-4">
                    {/* Book Mock Cover representation */}
                    <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${book.coverGradient} shadow-md flex-shrink-0 flex flex-col justify-between p-2 text-white font-bold select-none relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                      <span className="text-[9px] opacity-75 uppercase tracking-wider">{book.category}</span>
                      <span className="text-[11px] leading-tight line-clamp-2">{book.title}</span>
                      <div className="absolute bottom-1 right-2 text-xl opacity-20">📖</div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-2 uppercase tracking-wide bg-slate-800 text-slate-400">
                        {book.category}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-violet-400 transition-colors duration-300 m-0">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium mb-1 line-clamp-1">{book.author}</p>
                      <p className="text-xs text-slate-500">Dono: <span className="text-slate-400">{book.owner}</span></p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-850 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      book.status === 'Disponível' ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        book.status === 'Disponível' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`} />
                      {book.status}
                    </span>

                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        book.status === 'Disponível'
                          ? 'bg-violet-950/60 hover:bg-violet-600 hover:text-white border border-violet-800/40 text-violet-300'
                          : 'bg-slate-800 text-slate-500 border border-slate-700/30 cursor-not-allowed'
                      }`}
                      disabled={book.status !== 'Disponível'}
                      onClick={() => handleRequestLoan(book.id)}
                    >
                      {book.status === 'Disponível' ? 'Solicitar Empréstimo' : 'Emprestado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-950/20">
              <span className="text-4xl">📚</span>
              <h3 className="text-lg font-bold text-white mt-3">Nenhum livro encontrado</h3>
              <p className="text-slate-500 text-sm mt-1">Tente redefinir sua pesquisa ou escolher outra categoria.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05060a] px-6 py-6 text-center text-sm text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="m-0">© 2026 Projeto BookShare. Desenvolvido com React, Vite e Tailwind CSS v4.</p>
          <div className="flex gap-4">
            <span className="text-slate-600">Docker compose watch ativado</span>
          </div>
        </div>
      </footer>

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white m-0">Compartilhar um novo livro</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBook} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Título do Livro
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Clean Code"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Autor
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Robert C. Martin"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Programação">Programação</option>
                    <option value="Design de Software">Design de Software</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Carreira">Carreira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nome do Dono
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-850 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white text-sm font-bold shadow-lg shadow-violet-600/10 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Compartilhar Livro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Auth Modal (Login / Register / Password Recovery) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
