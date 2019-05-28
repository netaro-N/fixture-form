'use strict';
import $ from 'jquery';

$('.evaluation-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const postId = button.data('post-id');
    const userId = button.data('user-id');
    const evaluation = (button.attr('data-user-evaluation') === 'false') ? true : false;
    $.post(`/post/${postId}/users/${userId}`,
      { evaluation: evaluation },
      (data) => {
        button.attr('data-user-evaluation', data.evaluation);
      });
    const nowGoodSum = parseInt(button.prev().text() );
    console.log(nowGoodSum);
  });
});
