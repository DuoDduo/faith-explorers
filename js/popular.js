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
       <a href="/">
         <img src="${post.imageSrc}" alt="">
       </a>
       <div class="postdetails">
         <div class="postlabel">
           <a href="/">${post.category}</a>
         </div>
         <a href="/">
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
         <a href="/">
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