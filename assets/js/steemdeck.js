var steemDeck = new Vue({
    el: '#app',
    data: {
        followers: 277,
        newFollowers: 0,
        following: 71,
        newReplies: 0,
        newUpvotes: 0,
        votingPower: 86.12,

        addNewTag: null,
        addHotTag: null,
        addTrendingTag: null,
        addBlogUser: null,
        addFeedUser: null
    },
    methods: {
        resetNewFollowers: function () {
            this.newFollowers = 0;
        },
        resetNewReplies: function () {
            this.newReplies = 0;
        },
        resetNewUpvotes: function () {
            this.newUpvotes = 0;
        }
    }
});

$('#followers').on('show.uk.modal', function () {
    steemDeck.resetNewFollowers();
});

$('#replies').on('show.uk.modal', function () {
    steemDeck.resetNewReplies();
});

$('#upvotes').on('show.uk.modal', function () {
    steemDeck.resetNewUpvotes();
});

setInterval(function () {
    ++steemDeck.followers;
    if (!$('#followers.uk-open').length) {
        ++steemDeck.newFollowers;
    }
}, 10000);

setInterval(function () {
    if (!$('#replies.uk-open').length) {
        ++steemDeck.newReplies;
    }
}, 15000);

setInterval(function () {
    if (!$('#upvotes.uk-open').length) {
        ++steemDeck.newUpvotes;
    }
}, 8000);

setInterval(function () {
    steemDeck.votingPower = parseFloat(steemDeck.votingPower + 0.01).toFixed(2);
}, 20000);

$('.row-refresh').on('click', function () {
    var newPost = $('.row').first().find('.post').first().clone();
    $('.row').first().find('.uk-slider').prepend(newPost);
    var slider = UIkit.slider($('.row').first(), { infinite: false, threshold: 50 });
});

$('.row').on('focusitem.uk.slider', function (event, index) {
    var numberOfPosts = $(this).find('.post').length,
        visiblePosts = window.innerWidth > 767 ? (window.innerWidth > 959 ? 4 : 2) : 1;

    $(this).find('.scroll-indicator').css('width', (visiblePosts / numberOfPosts * 100).toFixed(2) + '%');
    $(this).find('.scroll-indicator').css('left', ((visiblePosts / numberOfPosts * 100) * (index / visiblePosts )).toFixed(2) + '%');
});

var cursorPosition = {};
$('.open-post').on('mousedown', function (e) {
    cursorPosition.x = e.clientX;
    cursorPosition.y = e.clientY;
});
$('.open-post').on('mouseup', function (e) {
    if (Math.abs(cursorPosition.x - e.clientX) < 25 && Math.abs(cursorPosition.y - e.clientY) < 25) {
        var modal = UIkit.modal('#post');

        if (modal.isActive()) {
            modal.hide();
        } else {
            modal.show();
        }
    }
});