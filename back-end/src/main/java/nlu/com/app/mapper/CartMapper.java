package nlu.com.app.mapper;

import nlu.com.app.dto.cart.Cart;
import nlu.com.app.dto.cart.CartItem;
import nlu.com.app.dto.response.CartItemResponseDTO;
import nlu.com.app.dto.response.CartResponseDTO;
import nlu.com.app.entity.Book;
import nlu.com.app.repository.BookRepository;
import nlu.com.app.repository.RedeemRepository;
import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author VuLuu
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true), uses = {RedeemRewardMapper.class})

public interface CartMapper {

    @Mapping(target = "items", source = "items", qualifiedByName = "mapCartItems")
    CartResponseDTO toCartResponseDTO(Cart cart,
                                      @Context BookRepository bookRepository,
                                      @Context Map<Long, Double> discountMap,
                                      @Context RedeemRepository redeemRepository
    );

    @Named("mapCartItems")
    default List<CartItemResponseDTO> mapCartItems(List<CartItem> items,
                                                   @Context BookRepository bookRepository,
                                                   @Context Map<Long, Double> discountMap, @Context RedeemRepository redeemRepository) {
        if (items == null) {
            return new ArrayList<>();
        }
        return items.stream()
                .map(item -> {
                    if (item.getTypePurchase().equals("BOOK")) {
                        new CartItemResponseDTO();
                        return CartItemResponseDTO.builder().typePurchase("BOOK").item(toBookItemResponseDTO(item, bookRepository, discountMap)).build();
                    } else {
                        new CartItemResponseDTO();
                        return CartItemResponseDTO.builder().typePurchase("REDEEM").item(toRewardItemResponseDTO(item, redeemRepository)).build();
                    }
                })
                .collect(Collectors.toList());
    }

    @Mapping(target = "productId", expression = "java(parseProductId(cartItem.getProductId()))")
    @Mapping(target = "title", source = "cartItem", qualifiedByName = "mapTitle")
    @Mapping(target = "price", source = "cartItem", qualifiedByName = "mapPrice")
    @Mapping(target = "discountedPrice", source = "cartItem", qualifiedByName = "mapDiscountedPrice")
    @Mapping(target = "discountPercentage", source = "cartItem", qualifiedByName = "mapDiscountPercentage")
    @Mapping(target = "imageUrl", source = "cartItem", qualifiedByName = "mapImageUrl")
    @Mapping(target = "categoryId", source = "cartItem", qualifiedByName = "mapCategoryId")
    CartItemResponseDTO.BookItemResponseDTO toBookItemResponseDTO(CartItem cartItem,
                                                                  @Context BookRepository bookRepository,
                                                                  @Context Map<Long, Double> discountMap);

    default Long parseProductId(String productId) {
        try {
            return Long.parseLong(productId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Named("mapTitle")
    default String mapTitle(CartItem cartItem, @Context BookRepository bookRepository) {
        return getBook(cartItem, bookRepository).map(Book::getTitle).orElse("");
    }

    @Named("mapPrice")
    default double mapPrice(CartItem cartItem, @Context BookRepository bookRepository) {
        return getBook(cartItem, bookRepository).map(book -> book.getPrice()).orElse(0.0);
    }

    @Named("mapDiscountedPrice")
    default double mapDiscountedPrice(CartItem cartItem,
                                      @Context BookRepository bookRepository,
                                      @Context Map<Long, Double> discountMap) {
        Long productId = parseProductId(cartItem.getProductId());
        if (productId == null) {
            return 0.0;
        }

        double discountPercentage = discountMap.getOrDefault(productId, 0.0);

        return getBook(cartItem, bookRepository)
                .map(book -> book.getPrice() * (1 - discountPercentage / 100.0))
                .orElse(0.0);
    }

    @Named("mapDiscountPercentage")
    default double mapDiscountPercentage(CartItem cartItem,
                                         @Context BookRepository bookRepository,
                                         @Context Map<Long, Double> discountMap) {
        Long productId = parseProductId(cartItem.getProductId());
        if (productId == null) {
            return 0.0;
        }

        return discountMap.getOrDefault(productId, 0.0);
    }

    @Named("mapImageUrl")
    default String mapImageUrl(CartItem cartItem, @Context BookRepository bookRepository) {
        return getBook(cartItem, bookRepository)
                .flatMap(book -> book.getImages().stream()
                        .filter(img -> img.isThumbnail() && img.getImageUrl() != null)
                        .map(img -> img.getImageUrl())
                        .findFirst())
                .orElse("");
    }

    @Named("mapCategoryId")
    default Long mapCategoryId(CartItem cartItem, @Context BookRepository bookRepository) {
        return getBook(cartItem, bookRepository)
                .map(book -> book.getCategory().getCategoryId())
                .orElse(null);
    }

    default Optional<Book> getBook(CartItem cartItem, BookRepository bookRepository) {
        Long productId = parseProductId(cartItem.getProductId());
        if (productId == null) {
            return Optional.empty();
        }
        return bookRepository.findById(productId);
    }

    private CartItemResponseDTO.RewardItemResponseDTO toRewardItemResponseDTO(CartItem item, RedeemRepository redeemRepository) {
        if (item == null || item.getProductId() == null) {
            return null;
        }
        return RedeemRewardMapper.INSTANCE.toRewardItemResponseDTO(item, redeemRepository);
    }
}


