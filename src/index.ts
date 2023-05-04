import express from "express";
import ejs from "ejs";
import path from "path";
import puppeteer from "puppeteer";

const app = express();

let extracts = [
  {
    type: "PIX",
    value: 50.5,
    date: new Date(new Date().getTime() - 4 ** 12).toLocaleTimeString(),
  },
  {
    type: "TED",
    value: 250.0,
    date: new Date(new Date().getTime() - 4 ** 11).toLocaleTimeString(),
  },
  {
    type: "Cartão de Crédito",
    value: 19.99,
    date: new Date().toLocaleTimeString(),
  },
];

app.get("/pdf2", async (req, res) => {
  let browser: any;
  extracts = new Array(500).fill(undefined).map(() => ({
    type: "PIX",
    value: 50.5,
    date: new Date(new Date().getTime() - 4 ** 12).toLocaleTimeString(),
  }));

  try {
    browser = await puppeteer.launch({ headless: "new" });
    const [page] = await browser.pages();
    const filePath = path.join(__dirname, "print.ejs");
    const html = await ejs.renderFile(filePath, { extracts });
    await page.setContent(html);
    const pdf = await page.pdf({ format: "A4" });
    res.contentType("application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=extract.pdf");
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  } finally {
    browser?.close();
  }
});

app.get("/pdf", async (req, res) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle0",
  });

  const pdf = await page.pdf({
    printBackground: true,
    format: "Letter",
  });
  if (browser) {
    await browser.close();
  }
  res.contentType("application/pdf");
  return res.send(pdf);
});

app.get("/", async (req, res) => {
  const filePath = path.join(__dirname, "print.ejs");
  try {
    const html = await ejs.renderFile(filePath, { extracts });
    return res.send(html);
  } catch (err) {
    return res.send("Erro na leitura do arquivo");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
