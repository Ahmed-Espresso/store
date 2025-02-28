let cart = JSON.parse(localStorage.getItem('cart')) || [];

// تحميل المنتجات
function loadProducts(jsonFile) {
    const container = document.getElementById('product-container');
    container.innerHTML = 'جارٍ التحميل...';
    fetch(jsonFile)
        .then(response => response.json())
        .then(products => {
            container.innerHTML = '';
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

// عرض رسالة منبثقة (SnackBar)
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'snackbar';  // تحديد الـ class الخاص بالرسالة
    toast.innerText = message;

    // إضافة الرسالة إلى الصفحة
    document.body.appendChild(toast);

    // إظهار الرسالة
    setTimeout(() => {
        toast.style.bottom = '30px';  // تحديد مكان الرسالة
    }, 100);

    // إخفاء الرسالة بعد 3 ثواني
    setTimeout(() => {
        toast.style.bottom = '-100px';  // إخفاء الرسالة
        setTimeout(() => {
            toast.remove();  // إزالة الرسالة من الصفحة
        }, 500);
    }, 3000);
}

// إضافة المنتج للسلة مع عرض الرسالة
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('تمت الإضافة للسلة');  // عرض الرسالة المنبثقة عند إضافة المنتج
    loadCart();
}
// تحميل السلة
function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <li>
                ${item.name} (x${item.quantity})
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <button onclick="removeFromCart('${item.name}')">حذف</button>
            </li>
        `;
    });

    // إضافة إجمالي المبلغ داخل السلة تحت المنتجات
    cartItems.innerHTML += `
        <li class="total-price">
            <strong>المجموع: ${total} جنيه</strong>
        </li>
    `;
}

// تحديث الكمية
function updateQuantity(name, delta) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
    }
}

// إزالة المنتج من السلة
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

// تأكيد السلة
function confirmCart() {
    document.getElementById('confirmation-modal').style.display = 'block';
}

// إغلاق نافذة التأكيد
function closeModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
}




// إرسال الطلب
function sendOrder() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const info = document.getElementById('additional-info').value.trim();

    if (!name || !phone) {
        showPopupMessage('يرجى إدخال الاسم ورقم الهاتف');
        return;
    }

    let total = 0; // إجمالي المبلغ
    const productsDetails = cart.map(item => {
        total += item.price * item.quantity; // حساب المجموع
        return `${item.name} (x${item.quantity}): ${item.price * item.quantity} جنيه`;
    }).join('\n');

    const message = `
        طلب جديد:
        الاسم: ${name}
        الهاتف: ${phone}
        الرسالة: ${info}
        المنتجات:
        ${productsDetails}
        -------------------
        المجموع الكلي: ${total} جنيه
    `;
    
    const whatsappURL = `https://wa.me/201030851648?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

localStorage.removeItem('cart'); // إعادة تعيين السلة


function showPopupMessage(message) {
    const popup = document.getElementById('popup-message');
    popup.textContent = message;
    popup.style.display = 'block';

    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000); // تختفي الرسالة بعد 3 ثوانٍ
}





// البحث عن المنتجات
function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const results = document.getElementById('product-container');
    results.innerHTML = '';

    if (query === '') {
        results.innerHTML = `<p>يرجى كتابة شيء في شريط البحث</p>`;
        return;
    }

    let found = false;
    ['section1.json', 'section2.json', 'section3.json'].forEach(file => {
        fetch(file)
            .then(response => response.json())
            .then(products => {
                const filtered = products.filter(p => p.name.toLowerCase().includes(query));
                if (filtered.length > 0) {
                    found = true;
                    filtered.forEach(product => {
                        results.innerHTML += `
                            <div class="product-card">
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
                            </div>
                        `;
                    });
                }
            })
            .then(() => {
                if (!found && results.innerHTML === '') {
                    results.innerHTML = `<p>لا توجد نتائج.</p>`;
                }
            });
    });
}

document.querySelectorAll('.info-icon').forEach(icon => {
  icon.addEventListener('click', function() {
    const description = this.closest('.product-card').querySelector('.product-description');
    description.classList.toggle('active');
  });
});




// تحميل المنتجات
function loadProducts(jsonFile) {
    const container = document.getElementById('product-container');
    container.innerHTML = 'جارٍ التحميل...';
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

                // الآن نضيف الكود الخاص بتحريك الصورة
                const imageContainer = productCard.querySelector('.product-image-container');
                const image = productCard.querySelector('.product-image');
                let isDragging = false;
                let startX = 0;
                let currentRotation = 0; // زاوية الدوران الحالية

                // عند بدء اللمس
                imageContainer.addEventListener('touchstart', (e) => {
                    isDragging = true;
                    startX = e.touches[0].clientX; // تحديد النقطة التي بدأت منها الحركة
                    imageContainer.style.transition = 'none'; // إيقاف الانتقال أثناء السحب لجعل الحركة أكثر سلاسة
                });

                // أثناء السحب
                imageContainer.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    const deltaX = e.touches[0].clientX - startX; // المسافة الأفقية المقطوعة
                    const rotationDelta = deltaX / 2; // تقسيم الإزاحة لجعل الدوران أكثر سلاسة
                    let newRotation = currentRotation + rotationDelta;

                    // تقييد الدوران ليكون بين -180 و 180 درجة
                    if (newRotation > 180) newRotation = 180;
                    if (newRotation < -180) newRotation = -180;

                    image.style.transform = `rotateY(${newRotation}deg)`; // تدوير الصورة
                });

                // عند إنهاء اللمس
                imageContainer.addEventListener('touchend', () => {
                    isDragging = false;
                    // إعادة الصورة إلى نقطة البداية
                    image.style.transition = 'transform 0.3s ease'; // إضافة تأثير الانتقال عند العودة
                    image.style.transform = 'rotateY(0deg)'; // العودة إلى 0 درجة
                    currentRotation = 0; // تحديث زاوية الدوران الحالية
                });
            });
        })
        .catch(() => {
            container.innerHTML = 'خطأ في تحميل المنتجات';
        });
}