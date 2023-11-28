let currentPage = 1; // Track the current page of blog posts
const postsPerPage = 3; // Number of posts to show per page
let blogPosts = []; // Array to store all blog posts

// Function to fetch blog data from the JSON file
async function fetchBlogData() {
  try {
    const response = await fetch('blog-data.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return [];
  }
}

// Function to render blog posts for a specific page
async function renderBlogPosts(page) {
  const blogSection = document.getElementById('blogSection');
  const startIdx = (page - 1) * postsPerPage;
  const endIdx = startIdx + postsPerPage;
  const postsToRender = blogPosts.slice(startIdx, endIdx);

  blogSection.innerHTML = ''; // Clear the existing posts

  postsToRender.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'edcard';
    postElement.dataset.aos = 'fade-up';

    postElement.innerHTML = `
      <div>
        <a href="#">
          <img src="${post.imageSrc}" alt="">
          <div class="edcarddetl">
            <div class="tegtime flex">
              <h5>#${post.category}</h5>
              <h5 class="flex">
                <i class="fa-regular fa-clock"></i>
                <span>${post.readTime}</span>mins read
              </h5>
            </div>
            <a href="#">
              <h2>${post.title}</h2>
            </a>
            <p class="content">${post.content}</p>
            <div class="postby flex">
              <div class="flex authorbx">
                <img src="./sopimages/Mummy FLo.jpg" alt="">
                <div class="authorname">
                  <h4>${post.author}</h4>
                  <span>${post.date}</span>
                </div>
              </div>
              <a href="#" class="readmore read-more-link" onclick="showFullContent(${post.id})"><span>Read more</span></a>
            </div>
          </div>
        </a>
        <div class="hidden-content" id="content-${post.id}">
          <!-- Full content will be dynamically loaded here -->
        </div>
      </div>
    `;

    blogSection.appendChild(postElement);
  });
}

// Function to render pagination controls
function renderPaginationControls() {
  const paginationContainer = document.getElementById('paginationControls');
  paginationContainer.innerHTML = ''; // Clear existing pagination controls

  for (let i = 1; i <= Math.ceil(blogPosts.length / postsPerPage); i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      renderBlogPosts(currentPage);
    });

    paginationContainer.appendChild(pageButton);
  }
}

// Function to fetch additional blog data from the JSON file
async function fetchMoreBlogData(page) {
  try {
    const response = await fetch(`blog-data${page}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching more blog data:', error);
    return [];
  }
}

// Function to render additional blog posts
async function renderMoreBlogPosts() {
  const blogSection = document.getElementById('blogSection');
  const moreBlogPosts = await fetchMoreBlogData(currentPage);

  const startIdx = (currentPage - 1) * postsPerPage;
  const endIdx = startIdx + postsPerPage;
  const postsToRender = moreBlogPosts.slice(startIdx, endIdx);

  postsToRender.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'edcard';
    postElement.dataset.aos = 'fade-up';

    postElement.innerHTML = `
      <div>
        <a>
          <img src="${post.imageSrc}" alt="">
          <div class="edcarddetl">
            <div class="tegtime flex">
              <h5>#${post.category}</h5>
              <h5 class="flex">
                <i class="fa-regular fa-clock"></i>
                <span>${post.readTime}</span>mins read
              </h5>
            </div>
            <a href="#">
              <h2>${post.title}</h2>
            </a>
            <p class="body">${post.body}</p>
            <div class="postby flex">
              <div class="flex authorbx">
                <img src="./sopimages/Mummy FLo.jpg" alt="">
                <div class="authorname">
                  <h4>${post.author}</h4>
                  <span>${post.date}</span>
                </div>
              </div>
              <a href="#" class="readmore read-more-link" onclick="showFullContent(${post.id})"><span>Read more</span></a>
            </div>
          </div>
        </a>
        <div class="hidden-content" id="content-${post.id}">
          <p>${post.body}</p>
        </div>
      </div>
    `;

    blogSection.appendChild(postElement);
  });

  currentPage++; // Increment the current page after rendering the posts
}

// Function to show more posts
function showMorePosts() {
  renderMoreBlogPosts();
}




// Function to show the full content in a modal
async function showFullContent(postId) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const body = document.body; // Reference to the body element

  const post = blogPosts.find(p => p.id === postId);

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${post.title}</h2>
      <span class="close" onclick="closeModal()"><i class="fas fa-times"></i></span>
    </div>
    <div class="modal-body">
      <p>${post.body}</p>
      <div class="postby flex">
        <div class="flex authorbx">
          <img src="./sopimages/Mummy FLo.jpg" alt="">
          <div class="authorname">
            <h4>${post.author}</h4>
            <span>${post.date}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  body.style.overflow = 'hidden'; // Prevent scrolling of the background content

  // Close the modal when the close icon is clicked
  window.closeModal = function () {
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    body.style.overflow = 'visible'; // Allow scrolling of the background content
  };

  // Close the modal if the user clicks outside the modal
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.visibility = 'hidden';
      modal.style.opacity = '0';
      body.style.overflow = 'visible'; // Allow scrolling of the background content
    }
  };
}


// Function to render recent posts
function renderRecentPosts(recentPosts) {
  const recentPostsContainer = document.querySelector('.posts');
  recentPostsContainer.innerHTML = '';

  recentPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post flex';
    postElement.dataset.aos = 'fade-up';

    postElement.innerHTML = `
      <a href="/">
        <img src="${post.imageSrc}" alt="">
      </a>
      <div class="postdetails">
        <div class="postlabel">
          <a href="#">${post.category}</a>
        </div>
        <a href="#">
          <h2>${post.title}</h2>
        </a>
        <p>${post.body}</p>
        <div class="posttimeteg flex">
          <div class="flex">
            ${post.tags.map(tag => `<h5><span>${tag}</span></h5>`).join('')}
          </div>
          <div class="tegtime">
            <h5 class="flex">
              <i class="fa-regular fa-clock"></i>
              <span>${post.readTime}</span>mins read
            </h5>
          </div>
        </div>
      </div>
    `;

    recentPostsContainer.appendChild(postElement);
  });
}

// Function to render popular posts
function renderPopularPosts(popularPosts) {
  const popularPostsContainer = document.querySelector('.populposts');
  popularPostsContainer.innerHTML = '';

  popularPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'popupost flex';
    postElement.dataset.aos = 'fade-down';

    postElement.innerHTML = `
      <img src="${post.imageSrc}" alt="">
      <div class="popupostde">
        <a href="#">
          <h4>${post.title}</h4>
        </a>
        <div class="poputime flex">
          <h5><span>${post.readTime}</span>mins read</h5>
          <p>▪</p>
          <h5>${post.date}</h5>
        </div>
      </div>
    `;

    popularPostsContainer.appendChild(postElement);
  });
}

// Function to render comments
function renderComments(comments) {
  const commentsContainer = document.querySelector('.postcomments');
  commentsContainer.innerHTML = '';

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';

    commentElement.innerHTML = `
      <p><span>"${comment.comment}"</span></p>
      <div class="authorcomment flex">
        <img src="${comment.author.avatar}" alt="">
        <div class="authortimename">
          <h5>${comment.author.name}</h5>
          <span>${comment.date}</span>
        </div>
      </div>
    `;

    commentsContainer.appendChild(commentElement);
  });
}
// Declare comments as a global variable
let comments = [];

// ... (Your existing code)

// Function to add a new comment
function addComment() {
  // Get form values
  const commentAuthor = document.getElementById('commentAuthor').value;
  const commentContent = document.getElementById('commentContent').value;
  const commentImageInput = document.getElementById('commentImage');

  // Check if an image is provided
  const commentImage = commentImageInput.files.length > 0 ? URL.createObjectURL(commentImageInput.files[0]) : null;

  // Create a new comment object
  const newCommentObj = {
    comment: commentContent,
    author: {
      name: commentAuthor,
      // You can add an avatar property if you collect avatars
    },
    image: commentImage,
    date: new Date().toLocaleDateString(),
  };

  // Add the new comment to the comments array
  comments.push(newCommentObj);

  // Render the updated comments
  renderComments(comments);

  // Clear the form
  document.getElementById('commentForm').reset();
}

function addComment() {
  var nameInput = document.getElementById('name-input');
  var commentInput = document.getElementById('comment-input');
  var nameText = nameInput.value.trim();
  var commentText = commentInput.value.trim();

  if (nameText !== '' && commentText !== '') {
      var commentsList = document.getElementById('comments-list');

      // Create a new comment element
      var commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `<strong>${nameText}</strong>: ${commentText}`;

      // Append the new comment to the comments list
      commentsList.appendChild(commentElement);

      // Clear the name and comment inputs
      nameInput.value = '';
      commentInput.value = '';
  }
}

// Initial rendering
async function initialize() {
  blogPosts = await fetchBlogData(); // Fetch blog posts
  await renderBlogPosts(currentPage);
  renderPaginationControls();
}

// Call initialize to start the rendering
initialize();
