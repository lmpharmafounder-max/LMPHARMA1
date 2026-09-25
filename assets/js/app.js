const products = [
  {slug:"creme-hydratante",title:"Crème hydratante",price:89,category:"Soin",image:"",description:"Crème hydratante pour les soins quotidiens de la peau.",available:true},
  {slug:"shampoing-doux",title:"Shampoing doux",price:75,category:"Cheveux",image:"",description:"Shampoing doux adapté à une routine quotidienne.",available:true},
  {slug:"gel-nettoyant",title:"Gel nettoyant visage",price:65,category:"Visage",image:"",description:"Gel nettoyant pour une routine visage simple.",available:true}
];

const money = n => `${Number(n).toFixed(2)} MAD`;
const waNumber = "212600000000"; // À REMPLACER par votre numéro WhatsApp, sans + ni espaces.

function card(p){
  const img = p.image ? `<img src="${p.image}" alt="${p.title}">` : `<div style="aspect-ratio:1/1;background:#f2f8f6;display:grid;place-items:center;color:#087f6b;font-weight:800">LMPHARMA</div>`;
  return `<article class="product">${img}<div class="product-body"><div class="muted">${p.category||""}</div><h3>${p.title}</h3><p>${p.description}</p><div class="price">${money(p.price)}</div><a class="btn" href="/produit.html?slug=${encodeURIComponent(p.slug)}">Voir</a></div></article>`;
}

function waLink(p){
  const text = `Bonjour LMPHARMA, je souhaite commander : ${p.title} — ${money(p.price)}.`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

const grid=document.querySelector("#product-grid");
if(grid){
  const render = list => grid.innerHTML = list.filter(p=>p.available!==false).map(card).join("");
  render(products);
  document.querySelector("#search")?.addEventListener("input", e=>{
    const q=e.target.value.toLowerCase();
    render(products.filter(p=>`${p.title} ${p.category} ${p.description}`.toLowerCase().includes(q)));
  });
}

const detail=document.querySelector("#product-detail");
if(detail){
  const slug=new URLSearchParams(location.search).get("slug");
  const p=products.find(x=>x.slug===slug) || products[0];
  const img=p.image ? `<img src="${p.image}" alt="${p.title}">` : `<div style="aspect-ratio:1/1;background:#f2f8f6;border-radius:20px;display:grid;place-items:center;color:#087f6b;font-weight:800">LMPHARMA</div>`;
  detail.innerHTML=`<div>${img}</div><div><span class="eyebrow">${p.category||"Produit"}</span><h1>${p.title}</h1><p>${p.description}</p><div class="price">${money(p.price)}</div><p class="muted">Paiement à la livraison.</p><a class="btn" target="_blank" rel="noopener" href="${waLink(p)}">Commander sur WhatsApp</a></div>`;
}
