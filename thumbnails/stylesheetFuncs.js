/*   Javascript functions for swapping stylesheets  */


/* ****************************************************************************************
*   function changeCSS                                                                    *
*       replaces a web page's css file with another student's css file                    *
*                                                                                         *
*   parameter: username                                                                   *
*       the GitHub name of the student whose css file you want to use                     *
*       note: put single quotes around the GitHub name                                    *
*                                                                                         *
*                                                                                         *
*   example:                                                                              *
*      onclick="changeCSS('sbogusvms')"                                                   *
*                                                                                         *
******************************************************************************************/

function changeCSS(username) {
		 		
 		setCSSHref("http://"+username+".github.io/thumbnails/galleryStyle.css");
      
}




/* ************************************************************************************************
*   function setCSSHref                                                                           *
*       replaces a web page's css file with another student's css file                            *
*                                                                                                 *
*   parameter: cssPath                                                                            *
*       the URL of the css file you want to use (including http://)                               *
*       note: put single quotes around the URL                                                    *
*                                                                                                 *
*   example                                                                                       *
*        onclick="setCSSHref('http://sbogusmvs.github.io/thumbnails/galleryStyle.css')"   *                                                                *
*                                                                                                 *
**************************************************************************************************/

function setCSSHref(cssPath){

		
		var linkArray = document.getElementsByTagName("link");
    var cssIndex = 0;
        
    var oldItem = linkArray[cssIndex];

    while(oldItem.rel.toLowerCase() != "stylesheet"){
      cssIndex++;
      oldItem = linkArray[cssIndex];
    }


    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssPath);
 
    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldItem);



}
