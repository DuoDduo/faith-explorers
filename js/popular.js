   // Fetch data from the JSON file or API endpoint
   fetch('popular.json')
   .then(response => response.json())
   .then(data => {
     // Call functions to render recent posts, popular posts, and latest comments
     renderRecentPosts(data.recentPosts);
     renderPopularPosts(data.popularPosts);
     renderLatestComments(data.latestComment);
   })
   .catch(error => console.error('Error fetching data:', error));

// Function to render recent posts
function renderRecentPosts(recentPosts) {
    const recentPostsSection = document.getElementById('recentPostsSection');
    const postsContainer = recentPostsSection.querySelector('.posts');
  
    recentPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'post flex';
      postElement.innerHTML = `
        <a>
          <img src="${post.imageSrc}" alt="">
        </a>
        <div class="postdetails">
          <div class="postlabel">
            <a>${post.category}</a>
          </div>
          <a class="post-title">
            <h2>${post.title}</h2>
          </a>
          <p>${post.content}</p>
          <div class="post-body hidden">
            <p>${post.body}</p>
            <button class="close-button">Close</button>
          </div>
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
  
      const postTitle = postElement.querySelector('.post-title');
      const postBody = postElement.querySelector('.post-body');
      const closeButton = postElement.querySelector('.close-button');
  
      // Event listener to show the modal when the title is clicked
      postTitle.addEventListener('click', () => {
        postBody.classList.remove('hidden');
      });
  
      // Event listener to hide the modal when the close button is clicked
      closeButton.addEventListener('click', () => {
        postBody.classList.add('hidden');
      });
  
      postsContainer.appendChild(postElement);
    });
  }

 // Function to render popular posts
function renderPopularPosts(popularPosts) {
    const popularPostsSection = document.getElementById('popularPostsSection');
    const popularPostsContainer = popularPostsSection.querySelector('.populposts');
  
    popularPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'popupost flex';
      postElement.innerHTML = `
        <img src="${post.imageSrc}" alt="">
        <div class="popupostde">
          <a class="post-title">
            <h4>${post.title}</h4>
            <div class="post-body hidden">
              <p>${post.body}</p>
              <button class="close-button">Close</button>
            </div>
          </a>
          <div class="poputime flex">
            <h5><span>${post.readTime}</span>mins read</h5>
            <p>▪</p>
            <h5>${post.date}</h5>
          </div>
        </div>
      `;
  
      const postTitle = postElement.querySelector('.post-title');
      const postBody = postElement.querySelector('.post-body');
      const closeButton = postElement.querySelector('.close-button');
  
      // Event listener to show the modal when the title is clicked
      postTitle.addEventListener('click', () => {
        postBody.classList.remove('hidden');
      });
  
      // Event listener to hide the modal when the close button is clicked
      closeButton.addEventListener('click', () => {
        postBody.classList.add('hidden');
      });
  
      popularPostsContainer.appendChild(postElement);
    });
  }

 // Function to render latest comments
 function renderLatestComments(latestComments) {
   const latestCommentsSection = document.getElementById('latestCommentsSection');
   const commentsContainer = latestCommentsSection.querySelector('.postcomments');

   latestComments.forEach(comment => {
     const commentElement = document.createElement('div');
     commentElement.className = 'comment';
     commentElement.innerHTML = `
       <p><span>${comment.comment}</span></p>
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