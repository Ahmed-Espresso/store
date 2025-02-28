document.addEventListener("DOMContentLoaded", function () {
    const sectionsContainer = document.getElementById('sections-container'); // الحاوية الرئيسية للأقسام

    // بيانات الأقسام: اسم القسم وملف JSON الخاص به
    const sections = [
        { title: "عروض", jsonFile: "summer-offers.json" },
        { title: "أحدث الإضافات", jsonFile: "new-arrivals.json" },
        { title: "تخفيضات", jsonFile: "discounts.json" }
    ];

    // إنشاء الأقسام بناءً على البيانات
    sections.forEach((section, index) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.innerHTML = `
            <h2>${section.title}</h2>
            <div id="section-${index}" class="products-container">جارٍ التحميل...</div>
        `;
        sectionsContainer.appendChild(sectionDiv);

        // تحميل المنتجات للقسم الحالي
        loadSectionProducts(section.jsonFile, `section-${index}`);
    });

    // تحميل المنتجات للقسم المحدد
    function loadSectionProducts(jsonFile, containerId) {
        const container = document.getElementById(containerId);

        fetch(jsonFile)
            .then(response => response.json())
            .then(products => {
                container.innerHTML = ''; // تفريغ الحاوية قبل تحميل المنتجات
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <div class="details-container">
                                <div class="icon">i</div>
                                <div class="contents">
                                    <h3>مواصفات المنتج</h3>
                                    <p>${product.description}</p>
                                </div>
                            </div>
                            <div class="product-image-container">
                                <img src="${product.image}" alt="${product.name}" class="product-image">
                            </div>
                            <div class="product-info">
                                <div class="product-name-price">
                                    <p class="product-name">${product.name}</p>
                                    <p class="product-price">${product.price} جنيه</p>
                                </div>
                                <button class="product-button" onclick="addToCart('${product.name}', ${product.price})">شراء</button>
                            </div>
                   
                    `;
                    container.appendChild(productCard);
                });
            })
            .catch(() => {
                container.innerHTML = 'خطأ في تحميل المنتجات';
            });
    }
});