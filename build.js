const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const YAML = require("yaml");

const ROOT = __dirname;

function readFile(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function readYaml(file) {
  if (!exists(file)) return {};
  return YAML.parse(readFile(file)) || {};
}

function readCollection(folder, extension) {
  const dir = path.join(ROOT, folder);

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith(extension))
    .map(file => {
      const fullPath = path.join(dir, file);
      const raw = fs.readFileSync(fullPath, "utf8");

      if (extension === ".md") {
        const parsed = matter(raw);

        return {
          slug: path.basename(file, ".md"),
          ...parsed.data,
          content: parsed.content
        };
      }

      return {
        slug: path.basename(file, extension),
        ...YAML.parse(raw)
      };
    });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function imageUrl(image) {
  if (!image) return "/assets/images/product-placeholder.svg";

  if (typeof image === "string") return image;

  if (image.url) return image.url;

  return "/assets/images/product-placeholder.svg";
}

const settings = readYaml("content/settings/store.yml");
const home = readYaml("content/home.yml");

const products = readCollection("products", ".md")
  .filter(product => product.available !== false);

const categories = readCollection("content/categories", ".yml")
  .filter(category => category.active !== false)
  .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const sliders = readCollection("content/slider", ".yml")
  .filter(slide => slide.active !== false)
  .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

const featuredProducts = products.filter(p => p.featured === true);

const displayProducts =
  featuredProducts.length > 0 ? featuredProducts : products;

function productCard(product) {
  const price = product.price ? `${escapeHtml(product.price)} DH` : "";
  const oldPrice = product.old_price
    ? `<span class="old-price">${escapeHtml(product.old_price)} DH</span>`
    : "";

  const category = product.category
    ? categories.find(c => c.slug === product.category)
    : null;

  return `
    <article class="product-card">
      <a class="product-image" href="/produit.html?product=${encodeURIComponent(product.slug)}">
        <img
          src="${escapeHtml(imageUrl(product.image))}"
          alt="${escapeHtml(product.title || "Produit")}"
          loading="lazy"
        >
        ${
          product.featured
            ? `<span class="product-badge">مميز</span>`
            : ""
        }
      </a>

      <div class="product-info">
        ${
          category
            ? `<span class="product-category">${escapeHtml(category.name)}</span>`
            : ""
        }

        <h3>
          <a href="/produit.html?product=${encodeURIComponent(product.slug)}">
            ${escapeHtml(product.title || "")}
          </a>
        </h3>

        ${
          product.short_description
            ? `<p>${escapeHtml(product.short_description)}</p>`
            : ""
        }

        <div class="price-row">
          <strong>${price}</strong>
          ${oldPrice}
        </div>

        <a
          class="product-button"
          href="/produit.html?product=${encodeURIComponent(product.slug)}"
        >
          اكتشف المنتج
        </a>
      </div>
    </article>
  `;
}

function categoryCard(category) {
  return `
    <a
      class="category-card"
      href="/produits.html?category=${encodeURIComponent(category.slug)}"
    >
      ${
        category.image
          ? `<img src="${escapeHtml(imageUrl(category.image))}" alt="${escapeHtml(category.name || "")}">`
          : `<div class="category-placeholder">✦</div>`
      }

      <div>
        <h3>${escapeHtml(category.name || "")}</h3>
        ${
          category.description
            ? `<p>${escapeHtml(category.description)}</p>`
            : ""
        }
      </div>
    </a>
  `;
}

function sliderMarkup() {
  if (!sliders.length) {
    return `
      <section class="hero">
        <div class="hero-content">
          <span class="hero-kicker">LM PHARMA</span>

          <h1>
            ${escapeHtml(
              home.hero_title ||
              "منتجات مختارة لصحتك وجمالك"
            )}
          </h1>

          <p>
            ${escapeHtml(
              home.hero_description ||
              "اكتشف مجموعتنا من المكملات الغذائية ومنتجات العناية، مع التوصيل لجميع أنحاء المغرب."
            )}
          </p>

          <a
            class="hero-button"
            href="${escapeHtml(home.hero_link || "#products")}"
          >
            ${escapeHtml(home.hero_button || "اكتشف المنتجات")}
          </a>
        </div>

        ${
          home.hero_image
            ? `
              <div class="hero-image">
                <img
                  src="${escapeHtml(imageUrl(home.hero_image))}"
                  alt="LM Pharma"
                >
              </div>
            `
            : `
              <div class="hero-decoration">
                <div class="circle circle-one"></div>
                <div class="circle circle-two"></div>
                <div class="hero-brand">
                  <span>LM</span>
                  <small>PHARMA</small>
                </div>
              </div>
            `
        }
      </section>
    `;
  }

  return `
    <section class="hero-slider">
      ${sliders.map((slide, index) => `
        <div class="slide ${index === 0 ? "active" : ""}">
          <img
            src="${escapeHtml(imageUrl(slide.image))}"
            alt="${escapeHtml(slide.title || "LM Pharma")}"
          >

          <div class="slide-overlay">
            <span>LM PHARMA</span>

            ${
              slide.title
                ? `<h1>${escapeHtml(slide.title)}</h1>`
                : ""
            }

            ${
              slide.description
                ? `<p>${escapeHtml(slide.description)}</p>`
                : ""
            }

            ${
              slide.button_link
                ? `
                  <a class="hero-button" href="${escapeHtml(slide.button_link)}">
                    ${escapeHtml(slide.button_text || "اكتشف الآن")}
                  </a>
                `
                : ""
            }
          </div>
        </div>
      `).join("")}

      ${
        sliders.length > 1
          ? `
            <button class="slider-arrow prev" onclick="changeSlide(-1)">‹</button>
            <button class="slider-arrow next" onclick="changeSlide(1)">›</button>

            <div class="slider-dots">
              ${sliders.map((_, i) =>
                `<button onclick="goToSlide(${i})" class="${i === 0 ? "active" : ""}"></button>`
              ).join("")}
            </div>
          `
          : ""
      }
    </section>
  `;
}

const logo = settings.logo
  ? imageUrl(settings.logo)
  : "";

const siteName = settings.site_name || "LM PHARMA";

const categoriesHTML = categories.length
  ? categories.map(categoryCard).join("")
  : `
      <div class="empty-state">
        أضف التصنيفات من لوحة التحكم
      </div>
    `;

const productsHTML = displayProducts.length
  ? displayProducts.map(productCard).join("")
  : `
      <div class="empty-state">
        لا توجد منتجات حالياً
      </div>
    `;

const whatsapp = settings.whatsapp
  ? String(settings.whatsapp).replace(/[^\d+]/g, "")
  : "";

const html = `<!doctype html>
<html lang="ar" dir="rtl">

<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>${escapeHtml(siteName)} — مكملات ومنتجات عناية</title>

  <meta
    name="description"
    content="${escapeHtml(
      settings.description ||
      "LM Pharma - مكملات غذائية ومنتجات العناية والجمال مع الدفع عند الاستلام."
    )}"
  >

  <link
    rel="stylesheet"
    href="/assets/css/style.css"
  >
</head>

<body>

<header class="site-header">

  <div class="container header-inner">

    <a class="brand" href="/">

      ${
        logo
          ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(siteName)}">`
          : `
            <div class="brand-text">
              <strong>LM</strong>
              <span>PHARMA</span>
            </div>
          `
      }

    </a>

    <nav class="main-nav">

      <a class="active" href="/">الرئيسية</a>

      <a href="/produits.html">المنتجات</a>

      <a href="#categories">التصنيفات</a>

      <a href="/a-propos.html">من نحن</a>

      <a href="/faq.html">الأسئلة الشائعة</a>

      <a href="/contact.html">اتصل بنا</a>

    </nav>

    <div class="header-actions">

      <a class="header-order" href="#products">
        تسوق الآن
      </a>

      <button
        class="mobile-menu"
        aria-label="القائمة"
        onclick="toggleMenu()"
      >
        ☰
      </button>

    </div>

  </div>

</header>

<main>

  ${sliderMarkup()}

  <section class="trust-bar">

    <div class="container trust-grid">

      <div>
        <span>🚚</span>
        <div>
          <strong>توصيل لجميع المغرب</strong>
          <small>نوصل حتى لباب دارك</small>
        </div>
      </div>

      <div>
        <span>💵</span>
        <div>
          <strong>الدفع عند الاستلام</strong>
          <small>خلص ملي توصلك الطلبية</small>
        </div>
      </div>

      <div>
        <span>✓</span>
        <div>
          <strong>منتجات مختارة</strong>
          <small>اختيارات بعناية</small>
        </div>
      </div>

      <div>
        <span>💬</span>
        <div>
          <strong>تواصل معنا</strong>
          <small>نحن رهن إشارتك</small>
        </div>
      </div>

    </div>

  </section>

  <section id="categories" class="section">

    <div class="container">

      <div class="section-heading">

        <div>
          <span class="section-kicker">اكتشف مجموعتنا</span>
          <h2>
            ${escapeHtml(
              home.categories_title || "تسوق حسب التصنيف"
            )}
          </h2>
        </div>

        <a href="/produits.html">
          جميع المنتجات ←
        </a>

      </div>

      <div class="categories-grid">
        ${categoriesHTML}
      </div>

    </div>

  </section>

  <section id="products" class="section products-section">

    <div class="container">

      <div class="section-heading">

        <div>
          <span class="section-kicker">منتجاتنا</span>

          <h2>
            ${escapeHtml(
              home.products_title || "منتجات مختارة لك"
            )}
          </h2>
        </div>

        <a href="/produits.html">
          مشاهدة الكل ←
        </a>

      </div>

      <div class="product-toolbar">

        <div class="search-box">

          <span>⌕</span>

          <input
            id="search"
            type="search"
            placeholder="قلب على منتج..."
          >

        </div>

      </div>

      <div id="product-grid" class="product-grid">
        ${productsHTML}
      </div>

    </div>

  </section>

  <section class="features-section">

    <div class="container">

      <div class="features-content">

        <span class="section-kicker">LM PHARMA</span>

        <h2>
          العناية بصحتك وجمالك تبدأ من الاختيار الصحيح
        </h2>

        <p>
          كنختارو ليك منتجات متنوعة فمجال المكملات الغذائية والعناية،
          مع تجربة شراء بسيطة وتوصيل لجميع أنحاء المغرب.
        </p>

        <a class="hero-button" href="/produits.html">
          اكتشف منتجاتنا
        </a>

      </div>

    </div>

  </section>

</main>

<footer class="footer">

  <div class="container footer-grid">

    <div class="footer-brand">

      <div class="brand-text">
        <strong>LM</strong>
        <span>PHARMA</span>
      </div>

      <p>
        ${escapeHtml(
          settings.description ||
          "مكملات غذائية ومنتجات العناية والجمال."
        )}
      </p>

    </div>

    <div>

      <h3>روابط مهمة</h3>

      <a href="/a-propos.html">من نحن</a>
      <a href="/livraison-retour.html">التوصيل والرجوع</a>
      <a href="/privacy.html">الخصوصية</a>
      <a href="/terms.html">الشروط والأحكام</a>

    </div>

    <div>

      <h3>تواصل معنا</h3>

      ${
        settings.phone
          ? `<a href="tel:${escapeHtml(settings.phone)}">${escapeHtml(settings.phone)}</a>`
          : ""
      }

      ${
        settings.email
          ? `<a href="mailto:${escapeHtml(settings.email)}">${escapeHtml(settings.email)}</a>`
          : ""
      }

      ${
        settings.address
          ? `<p>${escapeHtml(settings.address)}</p>`
          : `<p>المغرب 🇲🇦</p>`
      }

    </div>

  </div>

  <div class="footer-bottom">
    © ${new Date().getFullYear()} ${escapeHtml(siteName)} — جميع الحقوق محفوظة
  </div>

</footer>

${
  whatsapp
    ? `
      <a
        class="whatsapp-button"
        href="https://wa.me/${whatsapp}"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
      >
        <span>◉</span>
      </a>
    `
    : ""
}

<script>

function toggleMenu() {
  document.querySelector(".main-nav")
    .classList.toggle("open");
}

let currentSlide = 0;

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".slider-dots button");

function showSlide(index) {

  if (!slides.length) return;

  currentSlide =
    (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle(
      "active",
      i === currentSlide
    );
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle(
      "active",
      i === currentSlide
    );
  });
}

function changeSlide(direction) {
  showSlide(currentSlide + direction);
}

function goToSlide(index) {
  showSlide(index);
}

if (slides.length > 1) {
  setInterval(() => {
    changeSlide(1);
  }, 6000);
}

const searchInput =
  document.getElementById("search");

if (searchInput) {

  searchInput.addEventListener("input", function() {

    const value =
      this.value.trim().toLowerCase();

    document
      .querySelectorAll(".product-card")
      .forEach(card => {

        const text =
          card.innerText.toLowerCase();

        card.style.display =
          text.includes(value)
            ? ""
            : "none";

      });

  });

}

</script>

</body>
</html>
`;

fs.writeFileSync(
  path.join(ROOT, "index.html"),
  html,
  "utf8"
);

console.log("LM Pharma build completed successfully.");
console.log("Products:", products.length);
console.log("Categories:", categories.length);
console.log("Sliders:", sliders.length);
`;
