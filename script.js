// ===== Fetch all posts =====
async function getPosts() {
  const res = await fetch('/api/posts');
  return await res.json();
}

// ===== Add new blog =====
async function addBlog(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !content) { alert("Title and Content are required"); return; }

  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, content })
  });

  alert("Blog saved successfully!");
  window.location.href = 'index.html';
}

// ===== Render homepage posts =====
async function renderPosts() {
  const posts = await getPosts();
  const container = document.getElementById('posts');
  if (!container) return;
  container.innerHTML = '';
  if (posts.length === 0) { container.innerHTML = '<p>No posts yet. Add one!</p>'; return; }

  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';

    // Post header with avatar
    const header = document.createElement('div');
    header.className = 'post-header';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = post.author.charAt(0).toUpperCase();
    const titleAuthor = document.createElement('div');
    titleAuthor.className = 'title-author';
    const titleLink = document.createElement('span');
    titleLink.className = 'title-input';
    titleLink.textContent = post.title;
    titleLink.addEventListener('click', () => window.location.href = 'blog.html?id=' + post.id);
    const author = document.createElement('p');
    author.innerHTML = `<em>by ${post.author}</em> • ${Math.ceil(post.content.split(" ").length / 200)} min read`;
    titleAuthor.appendChild(titleLink);
    titleAuthor.appendChild(author);
    header.appendChild(avatar);
    header.appendChild(titleAuthor);

    // Post snippet
    const snippet = document.createElement('p');
    snippet.textContent = post.content.substring(0, 150) + '...';

    // Footer with comments
    const footer = document.createElement('div');
    footer.className = 'post-footer';
    const commentIcon = document.createElement('span');
    commentIcon.innerHTML = `<i class="ri-chat-3-line"></i> ${post.comments.length}`;
    footer.appendChild(commentIcon);

    div.appendChild(header);
    div.appendChild(snippet);
    div.appendChild(footer);
    container.appendChild(div);
  });
}

// ===== Load single blog post =====
async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const res = await fetch('/api/posts/' + id);
  if (!res.ok) { document.getElementById('post').innerHTML = '<p>Post not found</p>'; return; }
  const post = await res.json();

  document.getElementById('post').innerHTML = `<h2>${post.title}</h2><p><em>by ${post.author}</em></p><div>${post.content}</div>`;

  const commentsList = document.getElementById('comments');
  commentsList.innerHTML = '';
  if (!post.comments.length) commentsList.innerHTML = '<li>No comments yet</li>';
  else post.comments.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.username}: ${c.text}`;
    commentsList.appendChild(li);
  });

  document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim() || 'Anonymous';
    const text = document.getElementById('commentText').value.trim();
    if (!text) { alert("Comment cannot be empty"); return; }

    await fetch(`/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text })
    });

    loadPost();
    document.getElementById('commentText').value = '';
  });
}