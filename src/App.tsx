import { useState, useEffect } from "react";
import { bind } from "cuelume";
import { Dropzone } from "./components/Dropzone";
import { Editor } from "./components/Editor";
import { GithubIcon } from "./components/GithubIcon";

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    bind();
  }, []);

  return (
    <>
      <div className="glass-card">
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
