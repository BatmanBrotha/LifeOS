import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// --- Firebase Configuration ---

// 1. PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyDfQsEv-TneJTYehqZkuVMs3A47fnWN9No",
  authDomain: "lifeos-5a04c.firebaseapp.com",
  projectId: "lifeos-5a04c",
  storageBucket: "lifeos-5a04c.firebasestorage.app",
  messagingSenderId: "1086021385061",
  appId: "1:1086021385061:web:b356f48d3de7a795fd7f8c",
};

// 2. Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- AI Logic ---

export const getAiResponse = async (userInput, chatHistory) => {
  const apiKey = "YOUR_API_KEY";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const prompt = `
You are a category-generating assistant. Your ONLY job is to output a clean, new-line separated list of 3-6 relevant categories based on the user's input. Do not add any extra text, explanations, or formatting.
User: ${userInput}
`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(`API request failed with status ${res.status}`);
    const data = await res.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return responseText.trim();
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "Sorry, I couldn't connect to the AI. Please check your API key and connection.";
  }
};

export const getSmartSuggestion = async (mood, time, deadline, allData) => {
  const apiKey = "YOUR_API_KEY";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const prompt = `
You are a smart personal assistant designed to combat overthinking and help users make productive use of their time.

Your task is to analyze the user's current situation and all their app data to provide a single, actionable suggestion.

**User's Current Situation:**
- Mood Level (1-10): ${mood}
- Time Available: ${time}
- Needs to be productive by: ${deadline}

**User's Data (from their app):**
${JSON.stringify(allData, null, 2)}

**Your Goal:**
Based on everything you see, give one smart suggestion for what the user should do right now. Your response must be a JSON object with two keys: "suggestion" (your recommendation) and "suggestedCategoryId" (the ID of the most relevant category, or null if not applicable).

**Reasoning Process:**
1.  **Analyze Mood**: If mood is low, prioritize leisure activities or simple, rewarding tasks. If mood is high, suggest more challenging or productive tasks.
2.  **Consider Time**: Ensure your suggestion fits within the user's available time.
3.  **Respect Deadline**: If the deadline is close, suggest a quick, focused task. If there's more time, a leisure activity might be appropriate.
4.  **Use Their Data**: Your suggestion should be based on the user's actual categories, tasks, and progress bars.

**Example Response Format:**
{
  "suggestion": "Your mood is a bit low and you have 30 minutes. I suggest working on the 'Design the new logo' task from your 'UI/UX Concepts' category. It's a creative task that might boost your energy.",
  "suggestedCategoryId": "categoryId123"
}
`;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      throw new Error(`API request failed with status ${res.status}`);
    const data = await res.json();
    const responseText = data.candidates[0].content.parts[0].text;
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error getting smart suggestion:", error);
    return {
      suggestion:
        "Sorry, I couldn't generate a suggestion right now. Maybe try a quick walk?",
      suggestedCategoryId: null,
    };
  }
};

// --- Helper Hooks & Components ---

const useLucide = (...dependencies) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
};

// --- Splash Screen Component ---

const StarfieldSplashScreen = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const THREE = window.THREE;
    if (!THREE) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      document.body.appendChild(script);
      script.onload = () => init(window.THREE);
      return;
    }
    const cleanup = init(THREE);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = (THREE) => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 5000;
    const posArray = new Float32Array(particlesCnt * 3);
    for (let i = 0; i < particlesCnt * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xffffff,
    });
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    camera.position.z = 2.5;

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect =
          mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div ref={mountRef} className="w-full h-full"></div>
    </div>
  );
};

const IntroSequence = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000); // Duration of the starfield splash

    return () => clearTimeout(timer);
  }, [navigate]);

  return <StarfieldSplashScreen />;
};

const SidebarChat = () => {
  const handleLogout = () => {
    signOut(auth);
  };
  return (
    <div className="w-64 h-screen bg-gray-100 p-4 hidden md:block border-r">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <Link
        to="/dashboard"
        className="text-blue-500 hover:underline mb-4 block"
      >
        Go to Dashboard
      </Link>
      <button onClick={handleLogout} className="text-red-500 hover:underline">
        Logout
      </button>
    </div>
  );
};

const ChatbotOverlay = ({ isChatOpen, setIsChatOpen }) => {
  useLucide(isChatOpen);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey there! Ask me for some categories, and I'll generate them for you.",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isThinking) return;

    const newUserMessage = { sender: "user", text: userInput };
    const thinkingMessage = { sender: "ai", text: "..." };

    setMessages((prev) => [...prev, newUserMessage, thinkingMessage]);
    const currentInput = userInput;
    setUserInput("");
    setIsThinking(true);

    try {
      const aiResponseText = await getAiResponse(currentInput, messages);
      const aiResponseMessage = { sender: "ai", text: aiResponseText };
      setMessages((prev) => [...prev.slice(0, -1), aiResponseMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white w-full h-full max-w-2xl mx-auto flex flex-col">
        <header className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <i data-lucide="bot" className="text-blue-500"></i>
            <h2 className="text-lg font-bold">AI Assistant</h2>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>
        </header>
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "justify-end" : ""
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <i data-lucide="bot" className="w-5 h-5"></i>
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-md ${
                    msg.sender === "ai"
                      ? "bg-gray-100"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.sender === "ai" && msg.text.includes("\n") ? (
                    <div className="flex flex-col gap-2">
                      {msg.text.split("\n").map((category, i) => (
                        <Link
                          key={i}
                          to={`/category/${encodeURIComponent(
                            category.trim()
                          )}`}
                          onClick={() => setIsChatOpen(false)}
                          className="text-blue-600 hover:underline"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i data-lucide="user" className="w-5 h-5"></i>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </main>
        <footer className="p-4 border-t flex-shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-gray-100 rounded-lg p-2"
          >
            <input
              type="text"
              placeholder="Ask me anything..."
              className="w-full bg-transparent focus:outline-none px-2"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isThinking}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 flex-shrink-0 disabled:opacity-50"
              aria-label="Send message"
              disabled={isThinking}
            >
              <i data-lucide="send" className="w-5 h-5"></i>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const DynamicDisplayPage = ({ userId }) => {
  const [categories, setCategories] = useState([]);
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);
  const [view, setView] = useState("grid");
  const [filterTerm, setFilterTerm] = useState("");
  const [sortMethod, setSortMethod] = useState("newest");
  const [lastDeleted, setLastDeleted] = useState(null);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isActionBotOpen, setIsActionBotOpen] = useState(false);

  useLucide(
    view,
    lastDeleted,
    isRecoveryOpen,
    recentlyDeleted,
    isActionBotOpen
  );

  // Fetch categories from Firestore in real-time
  useEffect(() => {
    if (!userId) return;
    const categoriesCol = collection(db, "users", userId, "categories");
    const unsubscribe = onSnapshot(categoriesCol, (snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategories(categoriesData);
    });
    return unsubscribe; // Cleanup listener on unmount
  }, [userId]);

  const handleCreateCategory = async () => {
    const title = prompt("Enter a title for the new category:");
    if (title && userId) {
      const newCategory = {
        title,
        content: "Add your description here...",
        tags: ["New"],
        createdAt: serverTimestamp(),
        locked: false,
        password: null,
      };
      await addDoc(collection(db, "users", userId, "categories"), newCategory);
    }
  };

  const handleDeleteCategory = async (e, categoryId) => {
    e.preventDefault();
    if (userId) {
      const categoryToDelete = categories.find((cat) => cat.id === categoryId);
      if (categoryToDelete) {
        setLastDeleted(categoryToDelete);
        await deleteDoc(doc(db, "users", userId, "categories", categoryId));
      }
    }
  };

  const handleUndoDelete = async () => {
    if (lastDeleted && userId) {
      const { id, ...categoryData } = lastDeleted;
      await setDoc(doc(db, "users", userId, "categories", id), categoryData);
      setLastDeleted(null);
    }
  };

  const handleLockCategory = async (e, categoryId) => {
    e.preventDefault();
    const password = prompt("Set a password for this category:");
    if (password && userId) {
      // In a real app, you should hash this password before saving!
      const categoryRef = doc(db, "users", userId, "categories", categoryId);
      await updateDoc(categoryRef, {
        locked: true,
        password: password, // IMPORTANT: This is not secure. Use hashing in a real app.
      });
    }
  };

  useEffect(() => {
    if (lastDeleted) {
      const timer = setTimeout(() => setLastDeleted(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastDeleted]);

  const processedData = useMemo(() => {
    let processed = [...categories];
    if (filterTerm) {
      processed = processed.filter(
        (item) =>
          item.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
          (item.content &&
            item.content.toLowerCase().includes(filterTerm.toLowerCase()))
      );
    }
    // Sorting logic can be added here if needed
    return processed;
  }, [filterTerm, categories]);

  const renderCards = () => {
    if (processedData.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          No categories found. Create one!
        </div>
      );
    }
    const gridClasses =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
    return (
      <div className={gridClasses}>
        {processedData.map((item) => (
          <Link
            to={`/category/${item.id}`}
            key={item.id}
            className="relative block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={(e) => handleLockCategory(e, item.id)}
                className="p-1 bg-white/50 rounded-full hover:bg-yellow-500 hover:text-white transition-colors"
              >
                <i
                  data-lucide={item.locked ? "lock" : "unlock"}
                  className="w-4 h-4"
                ></i>
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-md mb-2 truncate text-gray-800 pr-12">
                {item.locked ? "Locked Category" : item.title}
              </h3>
              <p
                className={`text-gray-600 text-sm mb-4 h-16 overflow-hidden ${
                  item.locked ? "blur-sm" : ""
                }`}
              >
                {item.locked
                  ? "Content is locked. Click to unlock."
                  : item.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-50 text-gray-800 min-h-screen">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b p-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-grow">
            <i
              data-lucide="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            ></i>
            <input
              type="text"
              placeholder="Filter cards..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              onClick={handleCreateCategory}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center gap-2"
            >
              <i data-lucide="plus" className="w-4 h-4"></i>
              Create New
            </button>
            <button className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 flex items-center gap-2">
              <i data-lucide="history" className="w-4 h-4"></i>
              Recover
            </button>
          </div>
        </div>
      </header>
      <main className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">{renderCards()}</div>
      </main>
      {lastDeleted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in-up">
          <p>Category "{lastDeleted.title}" deleted.</p>
          <button
            onClick={handleUndoDelete}
            className="font-bold hover:underline"
          >
            Undo
          </button>
        </div>
      )}
      <ImmediateActionBotModal
        isOpen={isActionBotOpen}
        setIsOpen={setIsActionBotOpen}
        userId={userId}
      />
      <button
        onClick={() => setIsActionBotOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-red-700 transition-transform transform hover:scale-110"
      >
        <i data-lucide="bot" className="w-8 h-8"></i>
      </button>
    </div>
  );
};

const ImmediateActionBotModal = ({ isOpen, setIsOpen, userId }) => {
  const [mood, setMood] = useState(5);
  const [time, setTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);

    // Fetch all data from Firestore
    const categoriesSnapshot = await getDocs(
      collection(db, "users", userId, "categories")
    );
    const allData = { categories: [] };
    for (const doc of categoriesSnapshot.docs) {
      const categoryData = {
        id: doc.id,
        ...doc.data(),
        tasks: [],
        progressBars: [],
      };
      const tasksSnapshot = await getDocs(
        collection(db, "users", userId, "categories", doc.id, "tasks")
      );
      categoryData.tasks = tasksSnapshot.docs.map((d) => d.data());
      allData.categories.push(categoryData);
    }

    const result = await getSmartSuggestion(mood, time, deadline, allData);
    setSuggestion(result);
    setIsLoading(false);
  };

  const handleNavigate = () => {
    if (suggestion.suggestedCategoryId) {
      navigate(`/category/${suggestion.suggestedCategoryId}`);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Immediate Action Bot</h2>
        {!suggestion ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mood Level: {mood}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full"
                />
              </div>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time available (e.g., 30 minutes)"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Productivity deadline (e.g., 3 PM)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleGetSuggestion}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              >
                {isLoading ? "Thinking..." : "Get Suggestion"}
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="mb-4">{suggestion.suggestion}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSuggestion(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Back
              </button>
              {suggestion.suggestedCategoryId && (
                <button
                  onClick={handleNavigate}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Go to Category
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- New Category Detail Page ---
const CategoryDetailPage = ({ userId }) => {
  const { id } = useParams(); // This is now the category document ID
  const [category, setCategory] = useState(null);
  const [content, setContent] = useState("");
  const [tasks, setTasks] = useState([]);
  const [progressBars, setProgressBars] = useState([]);
  const [isPillExpanded, setIsPillExpanded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate();

  useLucide(isPillExpanded, tasks.length, progressBars.length, category);

  // Fetch all data for this category from Firestore
  useEffect(() => {
    if (!userId || !id) return;

    // Fetch category details
    const categoryDocRef = doc(db, "users", userId, "categories", id);
    const unsubscribeCategory = onSnapshot(categoryDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCategory(data);
        setContent(data.content || "");
        if (!data.locked) {
          setIsUnlocked(true);
        }
      }
    });

    // Fetch tasks
    const tasksColRef = collection(
      db,
      "users",
      userId,
      "categories",
      id,
      "tasks"
    );
    const unsubscribeTasks = onSnapshot(tasksColRef, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    // Fetch progress bars
    const progressColRef = collection(
      db,
      "users",
      userId,
      "categories",
      id,
      "progressBars"
    );
    const unsubscribeProgress = onSnapshot(progressColRef, (snapshot) => {
      setProgressBars(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });

    return () => {
      unsubscribeCategory();
      unsubscribeTasks();
      unsubscribeProgress();
    };
  }, [userId, id]);

  // Save content to Firestore on change
  const handleContentChange = async (newContent) => {
    setContent(newContent);
    if (userId && id) {
      const categoryDocRef = doc(db, "users", userId, "categories", id);
      await updateDoc(categoryDocRef, { content: newContent });
    }
  };

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
  };

  const handleAddTask = async () => {
    const taskText = prompt("Enter your task:");
    if (taskText && userId && id) {
      const deadline = prompt("Enter a deadline (e.g., 'Tomorrow'):");
      const mood = prompt("Enter your mood for this task (e.g., 'Focused'):");
      await addDoc(collection(db, "users", userId, "categories", id, "tasks"), {
        text: taskText,
        completed: false,
        deadline,
        mood,
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    if (userId && id) {
      const taskDocRef = doc(
        db,
        "users",
        userId,
        "categories",
        id,
        "tasks",
        taskId
      );
      await updateDoc(taskDocRef, { completed: !currentStatus });
    }
  };

  const handleAddProgressBar = async () => {
    const goal = parseInt(
      prompt("Enter the total number of steps for this goal:"),
      10
    );
    if (goal && !isNaN(goal) && userId && id) {
      await addDoc(
        collection(db, "users", userId, "categories", id, "progressBars"),
        {
          current: 0,
          goal,
          createdAt: serverTimestamp(),
        }
      );
    }
  };

  const handleProgressChange = async (barId, current, goal, change) => {
    if (userId && id) {
      const newCurrent = Math.max(0, Math.min(goal, current + change));
      const barDocRef = doc(
        db,
        "users",
        userId,
        "categories",
        id,
        "progressBars",
        barId
      );
      await updateDoc(barDocRef, { current: newCurrent });
    }
  };

  const handleDeleteCategory = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      if (userId && id) {
        await deleteDoc(doc(db, "users", userId, "categories", id));
        navigate("/dashboard");
      }
    }
  };

  const handleUnlock = () => {
    const password = prompt("Enter password to unlock:");
    if (password === category.password) {
      setIsUnlocked(true);
    } else {
      alert("Incorrect password!");
    }
  };

  const handleToggleLock = async () => {
    if (!userId || !id) return;
    const categoryRef = doc(db, "users", userId, "categories", id);

    if (category.locked) {
      const password = prompt(
        "Enter password to unlock this category permanently:"
      );
      if (password === category.password) {
        await updateDoc(categoryRef, {
          locked: false,
          password: null,
        });
        setIsUnlocked(true);
      } else if (password) {
        alert("Incorrect password!");
      }
    } else {
      const password = prompt("Set a password for this category:");
      if (password) {
        await updateDoc(categoryRef, {
          locked: true,
          password: password,
        });
      }
    }
  };

  const menuOptions = [
    {
      icon: "trending-up",
      label: "Progress Bar",
      action: handleAddProgressBar,
    },
    { icon: "check-square", label: "Task", action: handleAddTask },
    {
      icon: "image",
      label: "Image",
      action: () => alert("Image upload coming soon!"),
    },
    { icon: "trash-2", label: "Delete", action: handleDeleteCategory },
  ];

  if (!category) {
    return <div className="p-6">Loading category...</div>;
  }

  if (category.locked && !isUnlocked) {
    return (
      <div className="flex-1 p-6 bg-white flex flex-col items-center justify-center">
        <i data-lucide="lock" className="w-16 h-16 text-gray-400 mb-4"></i>
        <h2 className="text-2xl font-bold mb-2">Category Locked</h2>
        <p className="text-gray-500 mb-4">
          Please enter the password to view this content.
        </p>
        <button
          onClick={handleUnlock}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-white">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <Link
            to="/dashboard"
            className="text-blue-500 hover:underline flex items-center gap-2 mb-2"
          >
            <i data-lucide="arrow-left"></i>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{category.title}</h1>
        </div>
        <button
          onClick={handleToggleLock}
          className="p-2 rounded-full hover:bg-gray-200"
          title={category.locked ? "Unlock Category" : "Lock Category"}
        >
          <i data-lucide={category.locked ? "lock" : "unlock"}></i>
        </button>
      </header>

      <div className="border rounded-lg">
        <div className="toolbar flex items-center gap-2 p-2 border-b bg-gray-50">
          <button
            onClick={() => applyFormat("bold")}
            className="p-2 rounded hover:bg-gray-200"
          >
            <i data-lucide="bold"></i>
          </button>
          <button
            onClick={() => applyFormat("italic")}
            className="p-2 rounded hover:bg-gray-200"
          >
            <i data-lucide="italic"></i>
          </button>
          <button
            onClick={() => applyFormat("underline")}
            className="p-2 rounded hover:bg-gray-200"
          >
            <i data-lucide="underline"></i>
          </button>
        </div>
        <div
          contentEditable="true"
          onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: content }}
          className="w-full h-60 p-4 focus:outline-none prose"
          placeholder="Start typing your notes here..."
        />
      </div>

      <div className="mt-8 space-y-4">
        {progressBars.map((bar) => (
          <div key={bar.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Progress</span>
              <span>
                {bar.current} / {bar.goal}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${(bar.current / bar.goal) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() =>
                  handleProgressChange(bar.id, bar.current, bar.goal, -1)
                }
                className="p-1 bg-gray-200 rounded-full"
              >
                <i data-lucide="minus"></i>
              </button>
              <button
                onClick={() =>
                  handleProgressChange(bar.id, bar.current, bar.goal, 1)
                }
                className="p-1 bg-gray-200 rounded-full"
              >
                <i data-lucide="plus"></i>
              </button>
            </div>
          </div>
        ))}

        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
              task.completed
                ? "bg-gray-100 text-gray-400 line-through"
                : "bg-blue-50"
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleTask(task.id, task.completed)}
              className="w-5 h-5"
            />
            <div className="flex-1">
              <p>{task.text}</p>
              <div className="text-xs text-gray-500 flex gap-4 mt-1">
                <span>Deadline: {task.deadline || "N/A"}</span>
                <span>Mood: {task.mood || "N/A"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Spread Menu */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="absolute bottom-0 right-0 flex flex-col items-end gap-3 pb-20">
          {isPillExpanded &&
            menuOptions.map((option, index) => (
              <button
                key={option.label}
                onClick={() => {
                  option.action();
                  setIsPillExpanded(false);
                }}
                className="w-auto h-12 px-4 bg-white rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-gray-100 transition-all duration-300"
                style={{
                  transform: isPillExpanded
                    ? "translateY(0)"
                    : `translateY(${(menuOptions.length - index) * 20}px)`,
                  opacity: isPillExpanded ? 1 : 0,
                  transitionDelay: `${index * 50}ms`,
                }}
                title={option.label}
              >
                <i data-lucide={option.icon} className="w-5 h-5"></i>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
        </div>
        <button
          onClick={() => setIsPillExpanded(!isPillExpanded)}
          className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform transform hover:scale-110 absolute bottom-0 right-0"
        >
          <i
            data-lucide={isPillExpanded ? "x" : "plus"}
            className="w-7 h-7"
          ></i>
        </button>
      </div>
    </div>
  );
};

// --- App Structure ---
const AppContent = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null); // Explicitly set to null on logout
      }
    });
    return unsubscribe;
  }, []);

  // If we don't know the user's auth status yet, show a loader
  if (userId === null && auth.currentUser === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex bg-gray-50 text-gray-800">
      <SidebarChat />
      <div className="flex-1">
        <Routes>
          <Route
            path="/dashboard"
            element={<DynamicDisplayPage userId={userId} />}
          />
          <Route
            path="/category/:id"
            element={<CategoryDetailPage userId={userId} />}
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed top-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-transform transform hover:scale-110"
        aria-label="Toggle AI Chat"
      >
        <i data-lucide={isChatOpen ? "x" : "bot"} className="w-7 h-7"></i>
      </button>
      <ChatbotOverlay isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome</h2>
          <p className="text-gray-400">Sign in to continue to your workspace</p>
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded-md">
            {error}
          </p>
        )}
        <form className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Login
            </button>
            <button
              onClick={handleSignUp}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"
            ></path>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <StarfieldSplashScreen />; // Or a simpler loader
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!user ? <IntroSequence /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="*"
          element={user ? <AppContent /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}
