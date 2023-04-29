// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story,showDeleteButton = false) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const showHeart = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        ${showDeleteButton ? getDeleteButton() : ''}
        ${showHeart ? getHeart(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getDeleteButton(){
  return `
    <span class='trash'>
    <i class="fas fa-trash"></i>
    </span>`;
}

function getHeart(story, user){
  const isFavorite = user.isFavorite(story);
  const heartStyle = isFavorite ? 'fas' : 'far';
  return `
    <span class='heart'>
      <i class="${heartStyle} fa-heart" style="color: #d80303;"></i>
    </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// submit a new story to the page

async function createStory(evt){
  console.debug("createStory");
  evt.preventDefault();

  // grab data from form
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();
  const username = currentUser.username;
  const storyData = {title,url,author,username};

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $storyForm.slideUp();
  $storyForm.trigger("reset");
}

$storyForm.on("submit",createStory);

// handle removing own stories
async function deleteStory(evt){
  console.debug("deleteStory");
  const storyId = $(evt.target).closest("li").attr("id");
  await storyList.removePost(currentUser, storyId);
  putOwnStoriesOnPage();
}
$ownStories.on('click','.trash', deleteStory);

// handle favorite/unfavorite for stories
async function favoriteStory(evt){
  console.debug("favoriteStory");

  let $target = $(evt.target);
  let storyId = $target.closest('li').attr('id');
  let story = storyList.stories.find(r => r.storyId === storyId);
  
  if($target.hasClass('fas')){
    await currentUser.unfavorite(story);
    $target.closest("i").toggleClass("fas far")
  }else{
    await currentUser.favorite(story);
    $target.closest("i").toggleClass("fas far")
  }
}

$storiesList.on('click', '.heart', favoriteStory);

// Show list of users own stories
function putOwnStoriesOnPage(){
  console.debug('putOwnStoriesOnPage');
  $ownStories.empty();

  if(currentUser.ownStories.length === 0){
    $ownStories.append(`<h3>You haven't submitted any stories yet!</h3>`);
  }else{
    for(let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story,true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

// show list of users favorited stories
function putFavoritesListOnPage(){
  console.debug('putFavoritesListOnPage');
  $favoriteStories.empty();

  if(currentUser.favorites.length === 0){
    $favoriteStories.append(`<h3>You haven't favorited any stories yet!</h3>`);
  } else{
    for(let story of currentUser.favorites){
      let $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
  }
  $favoriteStories.show();
}