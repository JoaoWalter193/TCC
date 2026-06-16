import express from "express";
import cors from "cors";
import morgan from "morgan";
import proxy from "express-http-proxy";
import { env } from "./config/environment";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (env.cors.origins.indexOf(origin) !== -1) return callback(null, true);
    if (origin.includes('100.81.137.43')) return callback(null, true);
    if (origin.includes('app.curitibativa.online')) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morgan.token("upstream", (req) => {
  const target = (req as any).targetUrl || "-";
  return target;
});

app.use(morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const target = (req as any).targetUrl || "-";
  const status = tokens.status(req, res);
  const ms = tokens["response-time"](req, res);
  return `[Gateway] ${method} ${url} -> ${target} :: ${status} ${ms}ms`;
}));

function logProxy(req: express.Request, _res: express.Response, next: express.NextFunction) {
  console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${(req as any).targetUrl}`);
  next();
}

const proxyTimeout = 30000;

app.use(env.bi.prefix, (req, _res, next) => {
  const stripped = req.originalUrl.replace(env.bi.prefix, "");
  (req as any).targetUrl = `${env.bi.baseUrl}${stripped}`;
  next();
}, logProxy, proxy(env.bi.baseUrl, {
  timeout: proxyTimeout,
  proxyReqPathResolver: (req) => {
    const stripped = req.originalUrl.replace(env.bi.prefix, "");
    return stripped;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error(`[Proxy Error] BI service: ${err.message}`);
    res.status(502).json({ error: "BI service unavailable" });
  },
}));

app.use(env.business.prefix, (req, _res, next) => {
  const stripped = req.originalUrl.replace(env.business.prefix, "");
  (req as any).targetUrl = `${env.business.baseUrl}${stripped}`;
  next();
}, logProxy, proxy(env.business.baseUrl, {
  timeout: proxyTimeout,
  proxyReqPathResolver: (req) => {
    const stripped = req.originalUrl.replace(env.business.prefix, "");
    return stripped;
  },
  proxyErrorHandler: (err, res, next) => {
    console.error(`[Proxy Error] Business service: ${err.message}`);
    res.status(502).json({ error: "Business service unavailable" });
  },
}));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    upstreams: {
      bi: env.bi.baseUrl,
      business: env.business.baseUrl,
    },
  });
});

// --- PLAYGROUND DE TESTES (notificações fictícias) ---
app.post("/playground/notificar/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;
  const { titulo, mensagem, proposicaoCodigo } = req.body;

  const payload = {
    titulo: titulo || "Nova proposição de Vereador Teste",
    mensagem: mensagem || "Ementa da proposição de teste para validação da UI",
    proposicaoCodigo: proposicaoCodigo || 1001,
  };

  try {
    const upstream = await fetch(
      `${env.business.baseUrl}/notificacoes/${usuarioId}/teste`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await upstream.json();
    res.json({ mock: true, enviado: payload, resposta: data });
  } catch (err: any) {
    res.status(502).json({
      error: "Business service unavailable",
      mock: true,
      payload,
      instrucao:
        "Se o backend não estiver rodando, use o mock do frontend: as notificações de fallback no notificacao.service.ts já funcionam automaticamente.",
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found in API Gateway" });
});

app.listen(env.port, () => {
  console.log(`[Gateway] Running on http://localhost:${env.port}`);
  console.log(`[Gateway] BI upstream    -> ${env.bi.baseUrl}${env.bi.prefix}/*`);
  console.log(`[Gateway] Business       -> ${env.business.baseUrl}${env.business.prefix}/*`);
  console.log(`[Gateway] CORS origins   -> ${env.cors.origins.join(", ")}`);
});
