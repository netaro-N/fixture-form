'use strict';
import $ from 'jquery';

$('.evaluation-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const postId = button.data('post-id');
    const userId = button.data('user-id');
    const evaluation = !button.data('user-evaluation') ? 'true' : 'false';
    //const nextAvailability = (availability + 1) % 3;
    $.post(`/post/${postId}/users/${userId}`,
      { evaluation: evaluation },
      (data) => {
console.log(data.evaluation);
        const nextEvaluation = data.evaluation ? 'true' : 'false';
console.log(nextEvaluation);
        button.data('user-evaluation', nextEvaluation);
      });
  });
});
