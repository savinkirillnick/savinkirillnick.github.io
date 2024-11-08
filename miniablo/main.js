const d = document.getElementById("main");
const title_screen = () => {

    const title_bg = document.createElement('div');
    title_bg.className = 'title_bg';
    d.appendChild(title_bg);

    const title_split_1 = document.createElement('div');
    title_split_1.className = 'title_head';
    title_split_1.classList.add('split_1');
    title_split_1.innerText = 'MINIABLO';
    d.appendChild(title_split_1);

    const title_split_2 = document.createElement('div');
    title_split_2.className = 'title_head';
    title_split_2.classList.add('split_2');
    title_split_2.innerText = 'MINIABLO';
    d.appendChild(title_split_2);

    const title_desc = document.createElement('div');
    title_desc.className = 'title_desc';
    title_desc.innerText = 'Diablo on minimals';
    d.appendChild(title_desc);

    const bottom_press = document.createElement('div');
    bottom_press.classList = 'bottom_press';
    bottom_press.innerText = 'press any key to start';
    d.appendChild(bottom_press);

    const full_screen = document.createElement('div');
    full_screen.classList = 'full_screen';
    d.appendChild(full_screen);

    document.body.addEventListener('click', myClick);

};

var myClick = (function() {
    var handler = function(event) {
        menu_screen();
        document.body.removeEventListener('click', handler);
    };
    return handler;
})( 0 );

const menu_screen = () => {
    const text = `
        <div class="title_bg"></div>
        <div class="menu_head split_1" id="title_screen">MINIABLO</div>
        <div class="menu_head split_2" id="title_screen">MINIABLO</div>
        <div class="button button_start" onClick="hero_select_screen()">START</div>
        <div class="button button_continue">CONTINUE</div>
        <div class="button button_demo">DEMO</div>
`;

    d.innerHTML = text;
};

const demo_screen = () => {
    
};

const hero_select_screen = () => {

    const text = `
        <div class="title_bg"></div>
        <div class="full_screen flex_container" id="cell">
            <div class="hero_tile">
                <div class="hero_selected"><div class="hero_warrior"></div></div><br>
            WARRIOR</div>
            <div class="hero_tile">
                <div class="hero_selected"><div class="hero_mage"></div></div><br>
            MAGE</div>
        </div>
        <div class="bottom_press" onClick="menu_screen()">back</div>
`;

    d.innerHTML = text;

}

const main = () => {
    title_screen();
};

main();