const CORS=["https://lorenzoalves290-blip.github.io","https://zenvik-loja-oficial.netlify.app"];
const headers={"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=60"};
export default async (req)=>{
 const origin=req.headers.get("origin")||"";
 if(origin&&CORS.includes(origin)){headers["Access-Control-Allow-Origin"]=origin;headers["Vary"]="Origin";}
 if(req.method==="OPTIONS"){headers["Access-Control-Allow-Methods"]="GET, OPTIONS";headers["Access-Control-Allow-Headers"]="Content-Type";return new Response(null,{status:204,headers});}
 if(req.method!=="GET")return new Response(JSON.stringify({ok:false,error:"Método não permitido."}),{status:405,headers});
 const url=new URL(req.url),q=url.searchParams.get("search")||"",cat=(url.searchParams.get("category")||"").toLowerCase();
 const local=[{id:"zenvik-pijama-amamentacao",name:"Pijama Feminino Gola Americana com Botões para Amamentação",brand:"Zenvik",category:"Moda",description:"Pijama confortável com abertura frontal para amamentação.",selling_price_brl:60,stock:50,image_url:"https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85",raw_json:{colors:["Preto","Rosa","Lilás","Cinza","Azul marinho"],sizes:{P:true,M:true,G:true,GG:true}}}];
 const providers=[
  ["ALIEXPRESS_API_BASE_URL","ALIEXPRESS_API_TOKEN","ALIEXPRESS_PRODUCTS_PATH"],
  ["FONEUP_API_BASE_URL","FONEUP_API_TOKEN","FONEUP_PRODUCTS_PATH"]
 ];
 let products=[];
 for(const [bk,tk,pk] of providers){
  const base=Netlify.env.get(bk),token=Netlify.env.get(tk),path=Netlify.env.get(pk)||"/products";
  if(!base||!token)continue;
  try{
   const target=new URL(path,base.endsWith("/")?base:base+"/");
   for(const [k,v] of url.searchParams)target.searchParams.set(k,v);
   const r=await fetch(target,{headers:{Accept:"application/json",Authorization:"Bearer "+token}});
   const j=await r.json().catch(()=>null);
   const rows=Array.isArray(j)?j:(Array.isArray(j?.products)?j.products:(Array.isArray(j?.data)?j.data:(Array.isArray(j?.data?.products)?j.data.products:[])));
   products.push(...rows.map((p,i)=>({id:String(p.id||p.productId||p.sku||"supplier-"+i),name:p.name||p.title||p.productName||"Produto",brand:"Zenvik",category:p.category||p.categoryName||"",description:p.description||p.desc||"",selling_price_brl:Number(p.selling_price_brl||p.price_brl||p.price||0),stock:Number(p.stock??p.quantity??0),image_url:p.image_url||p.image||p.mainImage||p.thumbnail||"",raw_json:p})).filter(p=>p.name&&p.image_url&&p.selling_price_brl>0));
  }catch{}
 }
 products=[...products,...local];
 const needle=q.toLowerCase();
 products=products.filter(p=>(!cat||String(p.category).toLowerCase().includes(cat))&&(!needle||String(p.name).toLowerCase().includes(needle)||String(p.description).toLowerCase().includes(needle)));
 return new Response(JSON.stringify({ok:true,count:products.length,products}),{status:200,headers});
};
export const config={path:"/api/products"};