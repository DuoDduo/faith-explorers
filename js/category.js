document.addEventListener('DOMContentLoaded', function () {
  // Fetch data from the JSON file
  fetch('category.json')
    .then(response => response.json())
    .then(data => {
      // Call the renderCategories function with the fetched data
      renderCategories(data);
    })
    .catch(error => console.error('Error fetching data:', error));
});

// Function to render categories
function renderCategories(data) {
  const categoryContainer = document.querySelector('.tegsec');
  const articlesContainer = document.querySelector('.articles');

  // Clear previous content
  categoryContainer.innerHTML = '';
  articlesContainer.innerHTML = '';

  // Loop through each category
  data.forEach((categoryData, index) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');
    categoryDiv.innerText = categoryData.category;

    // Add a click event listener to each category div
    categoryDiv.addEventListener('click', () => renderArticles(index, data));

    categoryContainer.appendChild(categoryDiv);
  });

  // Show categories container and hide articles container
  categoryContainer.style.display = 'flex';
  articlesContainer.style.display = 'none';
}

// Function to render articles based on category index
function renderArticles(categoryIndex, data) {
  const categoryContainer = document.querySelector('.tegsec');
  const articlesContainer = document.querySelector('.articles');

  // Clear previous content
  categoryContainer.innerHTML = '';
  articlesContainer.innerHTML = '';

  // Display back button
  const backButton = document.createElement('button');
  backButton.innerText = 'Back to Categories';
  backButton.classList.add('back-button');
  backButton.addEventListener('click', () => renderCategories(data));
  articlesContainer.appendChild(backButton);

  // Get the articles for the selected category
  const articles = data[categoryIndex].articles;

  // Loop through each article and display title and content
  articles.forEach((article, articleIndex) => {
    const articleDiv = document.createElement('div');
    articleDiv.classList.add('article');
    articleDiv.innerHTML = `
      <h2>${article.title}</h2>
      <p>${article.content}</p>
    `;

    // Add a click event listener to each article div
    articleDiv.addEventListener('click', () => renderArticleBody(article, data, categoryIndex));

    articlesContainer.appendChild(articleDiv);
  });

  // Hide categories container and show articles container
  categoryContainer.style.display = 'none';
  articlesContainer.style.display = 'block';
}

// Function to render article body beneath the content
function renderArticleBody(article, data, categoryIndex) {
  const articlesContainer = document.querySelector('.articles');
  const articleBodyContainer = document.createElement('div');
  articleBodyContainer.classList.add('article-body-container');
  articleBodyContainer.innerHTML = `
    <h2>${article.title}</h2>
    <p>${article.content}</p>
    <p>${article.body}</p>
  `;

  // Display back button
  const backButton = document.createElement('button');
  backButton.innerText = 'Back to Articles';
  backButton.addEventListener('click', () => renderArticles(categoryIndex, data));
  backButton.classList.add('back-Button');
  articleBodyContainer.appendChild(backButton);

  // Clear previous content
  articlesContainer.innerHTML = '';

  // Append article body container to articles container
  articlesContainer.appendChild(articleBodyContainer);
}

// Call renderCategories initially
document.addEventListener('DOMContentLoaded', function () {
  fetch('category.json')
    .then(response => response.json())
    .then(data => {
      renderCategories(data);
    })
    .catch(error => console.error('Error fetching data:', error));
});

