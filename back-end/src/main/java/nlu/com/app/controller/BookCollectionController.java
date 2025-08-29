package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.AddBooksToCollectionRequestDTO;
import nlu.com.app.dto.request.BookCollectionDetailsDTO;
import nlu.com.app.dto.request.CreateBookCollectionRequestDTO;
import nlu.com.app.dto.request.UpdateBookCollectionRequestDTO;
import nlu.com.app.dto.response.BookCollectionResponse;
import nlu.com.app.service.BookCollectionService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author VuLuu
 */
@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class BookCollectionController {

  private final BookCollectionService collectionService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public AppResponse<BookCollectionResponse> createCollection(
          @ModelAttribute CreateBookCollectionRequestDTO request,
          @RequestPart(value="image", required = false)MultipartFile image
          ) {
    return AppResponse.<BookCollectionResponse>builder().result(collectionService.createCollection(request,image)).build();
  }

  @GetMapping
  public ResponseEntity<Page<BookCollectionResponse>> getUserCollections(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    Page<BookCollectionResponse> response = collectionService.getCollectionsByUser(page, size);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{collectionId}")
  public ResponseEntity<BookCollectionResponse> updateCollection(
      @PathVariable Long collectionId,
      @RequestBody UpdateBookCollectionRequestDTO request) {

    BookCollectionResponse response = collectionService.updateCollection(collectionId, request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{collectionId}/books")
  public AppResponse<String> addBooksToCollection(
      @PathVariable Long collectionId,
      @RequestBody AddBooksToCollectionRequestDTO request) {
      String response = collectionService.addBooksToCollection(collectionId, request);
      if(response.equals("Sách này đã tồn tại trong bộ sách. Xin hãy lưu sách khác")) {
          return AppResponse.<String>builder().code(1000).result(response).build();
      }
      if(response.equals("Lưu sách thành công")) {
          return AppResponse.<String>builder().result(response).build();
      }

    return AppResponse.<String>builder().code(9999).result(response).build();
  }
  @GetMapping("/{collectionId}")
  public ResponseEntity<BookCollectionDetailsDTO> getCollectionDetails(@PathVariable Long collectionId) {
    BookCollectionDetailsDTO response = collectionService.getCollectionDetails(collectionId);
    return ResponseEntity.ok(response);
  }
  @PutMapping("/{collectionId}/delete")
  public ResponseEntity<Void> deleteCollection(@PathVariable Long collectionId) {
    collectionService.deleteCollection(collectionId);
    return ResponseEntity.ok().build();
  }
  @PutMapping("/{collectionId}/books/{bookId}/delete")
  public ResponseEntity<Void> deleteBookFromCollectionItem(@PathVariable Long collectionId, @PathVariable Long bookId) {
    collectionService.deleteBookFromCollectionItem(collectionId, bookId);
    return ResponseEntity.ok().build();
  }
  @GetMapping("/search")
  public ResponseEntity<Page<BookCollectionResponse>> findBookCollectionByName(
          @RequestParam int page,
          @RequestParam String name){
      return ResponseEntity.ok(collectionService.findBookCollectionByName(name, page, 5));
  }

}
