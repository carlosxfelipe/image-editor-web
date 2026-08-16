import { useState, useEffect } from "react";
import { bind } from "cuelume";
import { Dropzone } from "./components/Dropzone";
import { Editor } from "./components/Editor";
import { GithubIcon } from "./components/GithubIcon";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  useEffect(() => {
    bind();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  return (
    <>
      <div className="glass-card" style={{ position: "relative" }}>
        <button
          className="btn-icon"
          onClick={cycleTheme}
          style={styles.themeToggle}
          title={`Tema: ${theme}`}
        >
          {theme === "light" && <Sun size={20} />}
          {theme === "dark" && <Moon size={20} />}
          {theme === "system" && <Monitor size={20} />}
        </button>

        <h1>ImageEditor</h1>
        <p className="subtitle">
          Edite suas imagens com facilidade direto no navegador, com total
          privacidade e segurança.
        </p>

        {!imageFile ? (
          <Dropzone onFileSelect={setImageFile} />
        ) : (
          <Editor imageFile={imageFile} onReset={() => setImageFile(null)} />
        )}
      </div>

      <footer style={styles.footer}>
        <a
          href="https://github.com/carlosxfelipe/image-editor-web"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
          data-cuelume-hover="tick"
        >
          <GithubIcon size={18} />
          Código Aberto no GitHub
        </a>
      </footer>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  themeToggle: {
    position: "absolute",
    top: "1.5rem",
    right: "1.5rem",
    zIndex: 10,
  },
  footer: {
    marginTop: "3rem",
    textAlign: "center",
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
};

export default App;
