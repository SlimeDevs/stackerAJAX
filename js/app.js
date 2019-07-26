// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
function showQuestion(question) {
	
	// clone our result template code
    const result = $('.templates .question').clone();

    // Set the question properties in result
    const questionElem = result.find('.question-text a');
    questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
    const asked = result.find('.asked-date');
    const date = new Date(1000 * question.creation_date);
    asked.text(date.toString());

	// set the .viewed for question property in result
    const viewed = result.find('.viewed');
    viewed.text(question.view_count);

	// set some properties related to asker
    const asker = result.find('.asker');
    asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
}

function showAnswerer(answerer) {
    // clone our result template code
    const result = $('.templates .answerer').clone();

    // Set the answerer properties in result
    const questionElem = result.find('.answerer a');
    questionElem.attr('href', answerer.user.link);
    questionElem.text(answerer.user.display_name);

    // Set the answerer reputation property in result
    const reputation = result.find('.reputation');
    reputation.text(answerer.user.reputation);

    // Set the answerer post count property in result
    const postCount = result.find('.post-count');
    postCount.text(answerer.post_count);

    return result;
}


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
function showSearchResults(query, resultNum) {
    const results = resultNum + ' results for <strong>' + query + '</strong>';
    return results;
}

// takes error string and turns it into displayable DOM element
function showError(error){
    const errorElem = $('.templates .error').clone();
    const errorText = '<p>' + error + '</p>';
    errorElem.append(errorText);
}

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
function getUnanswered(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
    const request = {
        tagged: tags,
        site: 'stackoverflow',
        order: 'desc',
        sort: 'creation'
    };

    $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
        const searchResults = showSearchResults(request.tagged, result.items.length);

        $('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
            const question = showQuestion(item);
            $('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
        const errorElem = showError(error);
        $('.search-results').append(errorElem);
	});
}

function getInspiration(tags) {
    const request = {
        site: 'stackoverflow',
        page: 1,
        sort: 'creation'
    };

    $.ajax({
        url: `http://api.stackexchange.com/2.2/tags/${tags}/top-answerers/month`,
        data: request,
        dataType: 'jsonp',
        type: 'GET'
    }).done(function(result) {
        const searchResults = showSearchResults(tags, result.items.length);

        $('.search-results').html(searchResults);
        //$.each is a higher order function. It takes an array and a function as an argument.
        //The function is executed once for each item in the array.
        $.each(result.items, function(i, item) {
            const answerer = showAnswerer(item);
            $('.results').append(answerer);
        });
    })
}


$(function() {
	$('.unanswered-getter').on('submit', function(event){
		event.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
        const tags = $(this).find("input[name='tags']").val();
        getUnanswered(tags);
	});

	$('.inspiration-getter').on('submit', function(event) {
	   event.preventDefault();
	   // zero out results if previous search has run
        $('.results').html('');
        // get the value of the tags the user submitted
        const tags = $(this).find("input[name='answerers']").val();
        getInspiration(tags);
    })
});
