let currentRecentPage = 1;
const RecentpostsPerPage = 3;
let blogPost = [];

async function fetchBlogData() {
    try {
        const response = await fetch('popular.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return [];
    }
}

async function renderBlogPosts(page) {
    const blogSection = document.getElementById('blogSection');
    const startIdx = (page - 1) * RecentpostsPerPage;
    const endIdx = startIdx + RecentpostsPerPage;
    const postsToRender = blogPosts.slice(startIdx, endIdx);

    blogSection.innerHTML = '';

    postsToRender.forEach(post => {
        const postElement = createPostElement(post);
        blogSection.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post flex';

    postElement.innerHTML = `
        <a href="#">
            <img src="${post.imageSrc}" alt="">
        </a>
        <div class="postdetails">
            <div class="postlabel">
                <a href="#">${post.category}</a>
            </div>
            <a href="#">
                <h2>"${post.title}"</h2>
            </a>
            <p>${post.content}</p>
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

    return postElement;
}

async function initialize() {
    blogPost = await fetchBlogData();
    await renderBlogPosts(currentPage);
}

initialize();
