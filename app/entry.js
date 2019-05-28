'use strict';
import $ from 'jquery';

$('.evaluation-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const postId = button.data('post-id');
    const userId = button.data('user-id');
    const evaluation = (button.attr('data-user-evaluation') === 'false') ? true : false;
console.log(evaluation);
    //const nextAvailability = (availability + 1) % 3;
    $.post(`/post/${postId}/users/${userId}`,
      { evaluation: evaluation },
      (data) => {
console.log('data.evaluationは' + data.evaluation);
//        const nextEvaluation = data.evaluation ? 'true' : 'false';
//console.log(nextEvaluation);
        button.attr('data-user-evaluation', data.evaluation);
      });
  });
});
