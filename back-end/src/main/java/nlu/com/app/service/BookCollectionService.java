package nlu.com.app.service;

import nlu.com.app.dto.request.AddBooksToCollectionRequestDTO;
import nlu.com.app.dto.request.BookCollectionDetailsDTO;
import nlu.com.app.dto.request.CreateBookCollectionRequestDTO;
import nlu.com.app.dto.request.UpdateBookCollectionRequestDTO;
import nlu.com.app.dto.response.BookCollectionResponse;
import org.springframework.data.domain.Page;

/**
 * @author VuLuu
 */
public interface BookCollectionService {

  BookCollectionResponse createCollection(CreateBookCollectionRequestDTO request);

  Page<BookCollectionResponse> getCollectionsByUser(int page, int size);

  BookCollectionResponse updateCollection(Long collectionId,
      UpdateBookCollectionRequestDTO request);

  String addBooksToCollection(Long collectionId, AddBooksToCollectionRequestDTO request);

  BookCollectionDetailsDTO getCollectionDetails(Long collectionId);
  void deleteCollection(Long collectionId);
  void deleteBookFromCollectionItem(Long collectionId, Long bookId);
  Page<BookCollectionResponse> findBookCollectionByName(String name, int page, int size);
}
