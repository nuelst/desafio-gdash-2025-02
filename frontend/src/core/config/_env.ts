export const validateEnv = () => {
  const required = ['VITE_API_URL'];
  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️ Variáveis de ambiente ausentes: ${missing.join(', ')}. Usando valores padrão.`,
    );
  }
};

validateEnv();

