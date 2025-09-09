(function(){
  const listEl = document.getElementById('blogList');
  const searchEl = document.getElementById('blogSearch');
  const tagCloudEl = document.getElementById('tagCloud');

  let allPosts = [];
  let activeTag = null;
  let q = '';

  function normalize(s){ return (s||'').toLowerCase(); }
  function matches(p){
    const hay = (p.title+' '+(p.excerpt||'')).toLowerCase();
    const okText = !q || hay.includes(q);
    const okTag = !activeTag || (Array.isArray(p.tags) && p.tags.map(normalize).includes(normalize(activeTag)));
    return okText && okTag;
  }

  function render(posts){
    const filtered = posts.filter(matches);
    if(!filtered.length){ listEl.innerHTML = '<p>No posts found.</p>'; return; }
    listEl.innerHTML = filtered.map(p => {
      const date = (p.date||'').slice(0,10);
      const url = (window.CMS && CMS.isEnabled()) ? `posts/${p.slug}/` : `posts/${p.slug}/`;
      const tags = (p.tags||[]).map(t => `<button class="tag-badge" data-tag="${t}">${t}</button>`).join(' ');
      return `
      <article class="card post-card">
        ${p.cover ? `<img class="post-cover" src="${p.cover}" alt="">` : ''}
        <h3><a href="${url}">${p.title}</a></h3>
        <time>${date}</time>
        <p>${p.excerpt||''}</p>
        <div class="tags">${tags}</div>
        <a class="btn btn-outline sm" href="${url}">Read</a>
      </article>`;
    }).join('');
    // bind tag clicks
    listEl.querySelectorAll('.tag-badge').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.tag;
        render(allPosts);
        highlightActiveTag();
      });
    });
  }

  function buildTagCloud(posts){
    const map = new Map();
    posts.forEach(p => (p.tags||[]).forEach(t => map.set(t, (map.get(t)||0)+1)));
    const items = Array.from(map.entries()).sort((a,b)=>b[1]-a[1]);
    tagCloudEl.innerHTML = items.map(([t,c]) => `<button class="tag-chip" data-tag="${t}">${t} <span>${c}</span></button>`).join(' ');
    tagCloudEl.querySelectorAll('.tag-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.tag;
        render(allPosts);
        highlightActiveTag();
      });
    });
    // Clear filter
    if(items.length){
      const clear = document.createElement('button');
      clear.textContent = 'Clear';
      clear.className = 'tag-chip clear';
      clear.addEventListener('click', () => { activeTag=null; render(allPosts); highlightActiveTag(); });
      tagCloudEl.appendChild(clear);
    }
  }

  function highlightActiveTag(){
    tagCloudEl.querySelectorAll('.tag-chip').forEach(el => {
      el.classList.toggle('active', el.dataset.tag === activeTag);
    });
    listEl.querySelectorAll('.tag-badge').forEach(el => {
      el.classList.toggle('active', el.dataset.tag === activeTag);
    });
  }

  (async () => {
    try{
      if(window.CMS && CMS.isEnabled()){
        allPosts = await CMS.listPosts();
      } else {
        const res = await fetch('js/posts.json'); allPosts = await res.json();
      }
      buildTagCloud(allPosts);
      render(allPosts);
    }catch(e){
      listEl.innerHTML = '<p>Unable to load posts.</p>';
    }
  })();

  searchEl && searchEl.addEventListener('input', e => { q = normalize(e.target.value); render(allPosts); });
})();