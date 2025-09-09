/* CMS bootstrap: Firebase optional backend. Store config in localStorage key 'fb_config' (JSON). */
window.CMS = (function(){
  const cfgRaw = localStorage.getItem('fb_config');
  let firebaseEnabled = false;
  let fb = null;
  async function initFirebase(){
    const cfg = JSON.parse(cfgRaw);
    const [{ initializeApp }, { getFirestore, collection, getDocs, query, orderBy, where, setDoc, doc, getDoc },
           { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword },
           { getStorage, ref, uploadBytes, getDownloadURL }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'),
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js')
    ]);
    const app = initializeApp(cfg);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);
    fb = { app, db, auth, storage, collection, getDocs, query, orderBy, where, setDoc, doc, getDoc,
           signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, ref, uploadBytes, getDownloadURL };
    firebaseEnabled = true;
  }
  async function listPosts(){
    if(cfgRaw){
      if(!firebaseEnabled) await initFirebase();
      const postsRef = fb.collection(fb.db, 'posts');
      const q = fb.query(postsRef, fb.orderBy('date', 'desc'));
      const snap = await fb.getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const res = await fetch('js/posts.json'); return await res.json();
    }
  }
  async function getPostBySlug(slug){
    if(cfgRaw){
      if(!firebaseEnabled) await initFirebase();
      const ref = fb.doc(fb.db, 'posts', slug);
      const snap = await fb.getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } else {
      const arr = await (await fetch('js/posts.json')).json();
      return arr.find(p => p.slug === slug);
    }
  }
  async function savePost(obj){
    if(!cfgRaw) throw new Error('Firebase not configured. Open /admin to configure.');
    if(!firebaseEnabled) await initFirebase();
    const slug = obj.slug;
    if(!obj.date) obj.date = new Date().toISOString().slice(0,10);
    if(typeof obj.tags === 'string'){ obj.tags = obj.tags.split(',').map(s=>s.trim()).filter(Boolean); }
    await fb.setDoc(fb.doc(fb.db, 'posts', slug), obj);
    return slug;
  }
  async function uploadCover(file){
    if(!cfgRaw) throw new Error('Firebase not configured.');
    if(!firebaseEnabled) await initFirebase();
    const storeRef = fb.ref(fb.storage, `covers/${Date.now()}_${file.name}`);
    await fb.uploadBytes(storeRef, file);
    return await fb.getDownloadURL(storeRef);
  }
  async function signIn(email, password){
    if(!cfgRaw) throw new Error('Firebase not configured.');
    if(!firebaseEnabled) await initFirebase();
    await fb.signInWithEmailAndPassword(fb.auth, email, password);
    return fb.auth.currentUser;
  }
  async function signUp(email, password){
    if(!cfgRaw) throw new Error('Firebase not configured.');
    if(!firebaseEnabled) await initFirebase();
    const cred = await fb.createUserWithEmailAndPassword(fb.auth, email, password);
    return cred.user;
  }
  async function signOut(){
    if(!cfgRaw) throw new Error('Firebase not configured.');
    if(!firebaseEnabled) await initFirebase();
    return fb.signOut(fb.auth);
  }
  function isEnabled(){ return !!cfgRaw; }
  return { listPosts, getPostBySlug, savePost, uploadCover, signIn, signOut, signUp, isEnabled };
})();