$(document).ready(function(){
    // likes and dislikes
    $(".fa").on("click", async function() {
        var likeClass = $(this).attr("class");
        var reviewId = $(this).closest('.grid-item').attr('id');
        var $totalLikes = $(this).closest('.react-post').find('.total-likes');

        $(this).toggleClass("clicked");

        // is like or unlike
        const isClicked = likeClass.includes("clicked");

        // is like or dislike
        const isLike = likeClass.includes("fa-thumbs-up");

        if (isLike) {
            var $otherLike = $(this).closest('.react-post').find(".fa-thumbs-down");
            if ($otherLike.hasClass("clicked")) {
                await submitLike(reviewId, true, false);
                $otherLike.toggleClass("clicked");
            }   
        } else {
            var $otherLike = $(this).closest('.react-post').find(".fa-thumbs-up");
            if ($otherLike.hasClass("clicked")) {
                await submitLike(reviewId, true, true);
                $otherLike.toggleClass("clicked");
            }  
        }

        $.post(
            'like',
            {reviewId: reviewId, isClicked: isClicked, isLike: isLike},
            function(data, status){
                if(status === 'success'){
                    $totalLikes.text(data.totalLikes + " people liked");
                }
                else{
                    alert('error');
                }
            }
        );

    });
});

async function submitLike(reviewId, isClicked, isLike) {
    await $.post(
        'like',
        {reviewId: reviewId, isClicked: isClicked, isLike: isLike},
        function(data, status){
            if(status !== 'success'){
                alert('error');
            }
        }
    );
}