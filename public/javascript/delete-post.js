//Deleting post functiom; Have not tested*
async function deleteFormHandler(event) {
  event.preventDefault();

  const id = window.location.toString().split('/')[
    window.location.toString().split('/').length - 1
  ];
  //May use the marked out code*
  const response = await fetch(`/api/posts/${id}`, {
    method: 'DELETE'
    // body: JSON.stringify({
    //   post_id: id
    // }),
    // headers: {
    //   'Content-Type': 'application/json'
    // }
  });

  if (response.ok) {
    document.location.replace('/dashboard/');
  } else {
    alert(response.statusText);
  }
}

document.querySelector('.delete-post-btn').addEventListener('click', deleteFormHandler);
